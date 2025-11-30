import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import EventCard from '../../../components/Activity_Card';
import FilterModal from '../../../components/Filter_Activity';
import {
  Activity,
  filterActivitiesByStudent,
  getActivitiesByStudentId,
} from '../../../services/activity';

export interface Event {
  id: string;
  name: string;
  org: string;
  start_time: string;
  end_time: string;
  location: string;
  status: string;
  img: string;
}

const ManageActivity: React.FC = () => {
  const navigation = useNavigation();
  const [eventsData, setEventsData] = useState<Activity[]>([]);
  const [studentId, setStudentId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [activeFilters, setActiveFilters] = useState<Record<string, string | null>>({});

  // Lấy studentId
  useEffect(() => {
    const fetchStudentId = async () => {
      const id = await AsyncStorage.getItem('student_id');
      setStudentId(id);
    };
    fetchStudentId();
  }, []);

  // Lấy tất cả hoạt động
  useEffect(() => {
    if (!studentId) return;

    const fetchActivities = async () => {
      setIsLoading(true);
      const res = await getActivitiesByStudentId(studentId);
      if (res.success && res.data) setEventsData(res.data);
      setIsLoading(false);
    };
    fetchActivities();
  }, [studentId]);

  // Map trạng thái frontend -> backend nếu cần
  const statusMapToBackend: Record<string, string> = {
    'Đã đăng ký': 'pending',
    'Đã duyệt': 'approved',
    'Đã từ chối': 'rejected',
    'Đã tham gia': 'attendanced',
  };

  const handleApplyFilters = async (filters: Record<string, string | null>) => {
    if (!studentId) return;
    console.log('Applying filters:', filters);
    setActiveFilters(filters);
    setIsModalVisible(false);
    setIsLoading(true);

    // Lọc chỉ lấy key có giá trị string
    const apiFilters: Record<string, string> = {};
    Object.entries(filters).forEach(([key, value]) => {
      if (value) {
        if (key === 'status') {
          apiFilters[key] = statusMapToBackend[value] || value;
        } else if (['field_id', 'org_unit_id', 'title'].includes(key)) {
          apiFilters[key] = value;
        }
      }
    });

    const hasFilter = Object.keys(apiFilters).length > 0;

    let res;
    if (!hasFilter) {
      res = await getActivitiesByStudentId(studentId);
    } else {
      res = await filterActivitiesByStudent(studentId, apiFilters);
    }

    if (res.success && res.data) setEventsData(res.data);

    setIsLoading(false);
  };

  // Map Activity -> Event
  const eventsForCard: Event[] = eventsData.map((a) => {
    let status = '';
    if (a.attendance) {
      status = 'Đã tham gia';
    } else if (a.registration?.status) {
      switch (a.registration.status) {
        case 'pending': status = 'Đã đăng ký'; break;
        case 'approved': status = 'Đã duyệt'; break;
        case 'rejected': status = 'Đã từ chối'; break;
        default: status = 'Không rõ trạng thái';
      }
    } else {
      status = 'Không rõ trạng thái';
    }

    return {
      id: a._id,
      name: a.title,
      org: a.org_unit_id?.name || 'Không rõ đơn vị',
      start_time: new Date(a.start_time).toLocaleDateString('vi-VN'),
      end_time: new Date(a.end_time).toLocaleDateString('vi-VN'),
      location: a.location || 'Chưa cập nhật',
      status,
      img: a.image || a.activity_image || '',
    };
  });

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor="#3f2b96" barStyle="light-content" />

      <View style={styles.header}>
        <View style={styles.headerContent}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Quản lý hoạt động</Text>
          <View style={styles.placeholder} />
        </View>
      </View>

      <View style={styles.filterContainer}>
        <TouchableOpacity style={styles.filterButton} onPress={() => setIsModalVisible(true)}>
          <Ionicons name="filter-outline" size={20} color="#fff" />
          <Text style={styles.filterButtonText}>Bộ lọc & Tìm kiếm</Text>
        </TouchableOpacity>
      </View>

      {isLoading ? (
        <ActivityIndicator size="large" color="#3f2b96" style={{ marginTop: 50 }} />
      ) : (
        <FlatList
          data={eventsForCard}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.eventCardWrapper}>
              <EventCard event={item} />
            </View>
          )}
          contentContainerStyle={styles.listContainer}
          ListEmptyComponent={() => (
            <Text style={styles.emptyText}>Không tìm thấy hoạt động nào phù hợp.</Text>
          )}
        />
      )}

      <FilterModal
        isVisible={isModalVisible}
        onClose={() => setIsModalVisible(false)}
        onApply={handleApplyFilters}
        initialFilters={activeFilters}
      />
    </View>
  );
};

export default ManageActivity;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f0f0f0' },
  header: { backgroundColor: '#3f2b96', paddingTop: 50, paddingBottom: 12 },
  headerContent: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 16 },
  backButton: { padding: 4 },
  headerTitle: { color: '#fff', fontSize: 18, fontWeight: 'bold', textAlign: 'center', flex: 1 },
  placeholder: { width: 24, height: 24 },
  filterContainer: { padding: 16, backgroundColor: 'white', borderBottomWidth: 1, borderBottomColor: '#e0e0e0' },
  filterButton: { flexDirection: 'row', backgroundColor: '#3f2b96', paddingVertical: 12, paddingHorizontal: 16, borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
  filterButtonText: { color: '#fff', fontSize: 16, fontWeight: '600', marginLeft: 8 },
  listContainer: { padding: 16 },
  eventCardWrapper: { marginBottom: 6 },
  emptyText: { textAlign: 'center', marginTop: 50, fontSize: 16, color: '#666' },
});
