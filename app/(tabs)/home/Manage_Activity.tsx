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
  StudentActivity,
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
  const [events, setEvents] = useState<StudentActivity[]>([]);
  const [studentId, setStudentId] = useState<string | null>(null);

  const [isLoading, setIsLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [activeFilters, setActiveFilters] = useState<Record<string, string | null>>({});

  useEffect(() => {
    const loadStudent = async () => {
      const id = await AsyncStorage.getItem('student_id');
      setStudentId(id);
    };
    loadStudent();
  }, []);

  const fetchAllActivities = async () => {
    if (!studentId) return;

    setIsLoading(true);
    const res = await getActivitiesByStudentId(studentId);

    if (res.success && res.data) {
      setEvents(res.data);
    }

    setIsLoading(false);
  };

  useEffect(() => {
    if (studentId) fetchAllActivities();
  }, [studentId]);

  const statusMapToBackend: Record<string, string> = {
    'Đã đăng ký': 'pending',
    'Đã duyệt': 'approved',
    'Đã từ chối': 'rejected',
    'Đã tham gia': 'attendanced',
  };

  // ===========================
  // Áp dụng lọc
  // ===========================
  const handleApplyFilters = async (filters: Record<string, string | null>) => {
    if (!studentId) return;

    setIsModalVisible(false);
    setActiveFilters(filters);

    setIsLoading(true);

    // Chuyển filters → apiFilters
    const apiFilters: Record<string, string> = {};

    Object.entries(filters).forEach(([key, value]) => {
      if (!value) return;
      if (key === 'status') apiFilters[key] = statusMapToBackend[value] || value;
      else apiFilters[key] = value;
    });

    const hasFilter = Object.keys(apiFilters).length > 0;

    const res = hasFilter
      ? await filterActivitiesByStudent(studentId, apiFilters)
      : await getActivitiesByStudentId(studentId); // Nếu reset thì load tất cả

    if (res.success && res.data) setEvents(res.data);

    setIsLoading(false);
  };

  // ===========================
  // Convert Activity → EventCard data
  // ===========================
  const eventsForCard: Event[] = events.map((a) => {
    let status = 'Không rõ trạng thái';

    if (a.attendance) {
      status = 'Đã tham gia';
    } else if (a.registration?.status) {
      switch (a.registration.status) {
        case 'pending': status = 'Đã đăng ký'; break;
        case 'approved': status = 'Đã duyệt'; break;
        case 'rejected': status = 'Đã từ chối'; break;
      }
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

      {/* HEADER */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>

          <Text style={styles.headerTitle}>Quản lý hoạt động</Text>
          <View style={{ width: 24 }} />
        </View>
      </View>

      {/* FILTER BUTTON */}
      <View style={styles.filterWrapper}>
        <TouchableOpacity
          style={styles.filterButton}
          onPress={() => setIsModalVisible(true)}
        >
          <Ionicons name="filter-outline" size={20} color="#fff" />
          <Text style={styles.filterButtonText}>Bộ lọc & Tìm kiếm</Text>
        </TouchableOpacity>
      </View>

      {/* LIST */}
      {isLoading ? (
        <ActivityIndicator size="large" color="#3f2b96" style={{ marginTop: 50 }} />
      ) : (
        <FlatList
          data={eventsForCard}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <View style={{ marginBottom: 8 }}>
              <EventCard event={item} />
            </View>
          )}
          ListEmptyComponent={
            <Text style={styles.empty}>Không tìm thấy hoạt động phù hợp.</Text>
          }
        />
      )}

      {/* MODAL */}
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
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  backButton: { padding: 4 },
  headerTitle: { color: '#fff', fontSize: 18, fontWeight: 'bold' },

  filterWrapper: {
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderColor: '#ddd',
  },
  filterButton: {
    flexDirection: 'row',
    backgroundColor: '#3f2b96',
    paddingVertical: 12,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
    marginLeft: 8,
  },

  list: { padding: 16 },

  empty: {
    textAlign: 'center',
    marginTop: 50,
    fontSize: 16,
    color: '#666',
  },
});
