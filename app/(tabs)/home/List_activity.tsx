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
  filterActivities,
  getAllActivities,
  StudentActivity,
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

const List_activity: React.FC = () => {
  const navigation = useNavigation();

  const [activities, setActivities] = useState<StudentActivity[]>([]);
  const [studentId, setStudentId] = useState<string | null>(null);

  const [isLoading, setIsLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [activeFilters, setActiveFilters] = useState<
    Record<string, string | null>
  >({});

  useEffect(() => {
    const loadStudentId = async () => {
      const id = await AsyncStorage.getItem('student_id');
      setStudentId(id);
    };
    loadStudentId();
  }, []);


  const fetchAllActivities = async () => {
    setIsLoading(true);

    const res = await getAllActivities();
    if (res.success && res.data) {
      setActivities(res.data);
    }

    setIsLoading(false);
  };

  useEffect(() => {
    fetchAllActivities();
  }, []);

  const handleApplyFilters = async (
    filters: Record<string, string | null>
  ) => {
    setIsModalVisible(false);
    setActiveFilters(filters);
    setIsLoading(true);

    const apiFilters: Record<string, string> = {};

    Object.entries(filters).forEach(([key, value]) => {
      if (value) apiFilters[key] = value; 
    });
    console.log('Applying filters:', apiFilters);
    const res =
      Object.keys(apiFilters).length > 0
        ? await filterActivities(apiFilters)
        : await getAllActivities();

    if (res.success && res.data) {
      setActivities(res.data);
    }

    setIsLoading(false);
  };

  const eventsForCard: Event[] = activities.map((a) => ({
    id: a._id,
    name: a.title,
    org: a.org_unit_id?.name || 'Không rõ đơn vị',
    start_time: new Date(a.start_time).toLocaleDateString('vi-VN'),
    end_time: new Date(a.end_time).toLocaleDateString('vi-VN'),
    location: a.location || 'Chưa cập nhật',
    status: a.status || 'Không xác định', 
    img: a.activity_image || '',
  }));

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor="#3f2b96" barStyle="light-content" />

      {/* HEADER */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>

          <Text style={styles.headerTitle}>Đăng ký tham gia</Text>
          <View style={{ width: 24 }} />
        </View>
      </View>

      {/* FILTER */}
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
        <ActivityIndicator
          size="large"
          color="#3f2b96"
          style={{ marginTop: 50 }}
        />
      ) : (
        <FlatList
          data={eventsForCard}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <View style={{ marginBottom: 8 }}>
              <EventCard event={item} from="list" />
            </View>
          )}
          ListEmptyComponent={
            <Text style={styles.empty}>
              Không tìm thấy hoạt động phù hợp.
            </Text>
          }
        />
      )}

      {/* FILTER MODAL */}
      <FilterModal
        isVisible={isModalVisible}
        onClose={() => setIsModalVisible(false)}
        onApply={handleApplyFilters}
        initialFilters={activeFilters}
          statusOptions={[
          'chờ duyệt',
          'chưa tổ chức',
          'đã từ chối',
          'đã tổ chức',
          'đang tổ chức',
          'đã hủy'
        ]}
      />
    </View>
  );
};

export default List_activity;

/* =========================
   Styles
========================= */
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f0f0f0' },

  header: {
    backgroundColor: '#3f2b96',
    paddingTop: 50,
    paddingBottom: 12,
  },
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
