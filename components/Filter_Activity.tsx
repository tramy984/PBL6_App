import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import { Modal, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { getAllOrgUnits, OrgUnit } from '../services/Org';

interface FilterModalProps {
  isVisible: boolean;
  onClose: () => void;
  onApply: (filters: Record<string, string | null>) => void;
  initialFilters: Record<string, string | null>;
}

const filterOptions = {
  status: ['Đã tham gia', 'Đã đăng ký', 'Chưa đăng ký'],
  field: ['Công nghệ thông tin', 'Kinh tế', 'Thiết kế', 'Kỹ thuật'],
};

const FilterModal: React.FC<FilterModalProps> = ({ isVisible, onClose, onApply, initialFilters }) => {
  const [filters, setFilters] = useState<Record<string, string | null>>(initialFilters);
  const [searchText, setSearchText] = useState(initialFilters.search || '');
  const [orgUnits, setOrgUnits] = useState<OrgUnit[]>([]);

  useEffect(() => {
    if (isVisible) {
      setFilters(initialFilters);
      setSearchText(initialFilters.search || '');
      fetchOrgUnits();
    }
  }, [isVisible, initialFilters]);

  const fetchOrgUnits = async () => {
  const response = await getAllOrgUnits();
  if (response.success && response.data) {
    setOrgUnits(response.data);
  } else {
    setOrgUnits([]);
    console.error(response.message || 'Lấy danh sách tổ chức thất bại');
  }
};

  const toggleFilter = (category: string, value: string) => {
    setFilters(prev => ({
      ...prev,
      [category]: prev[category] === value ? null : value,
    }));
  };

  const handleSearchChange = (text: string) => setSearchText(text);

  const handleApply = () => {
    onApply({ ...filters, search: searchText.trim() || null });
    onClose();
  };

  const handleReset = () => {
    setFilters({});
    setSearchText('');
  };

  const FilterPill: React.FC<{ category: string; value: string }> = ({ category, value }) => (
    <TouchableOpacity
      style={[styles.pill, filters[category] === value && styles.pillSelected]}
      onPress={() => toggleFilter(category, value)}
    >
      <Text style={[styles.pillText, filters[category] === value && styles.pillTextSelected]}>
        {value}
      </Text>
      {filters[category] === value && <Ionicons name="checkmark" size={16} color="#fff" style={styles.pillIcon} />}
    </TouchableOpacity>
  );

  const getSelectedCount = () =>
    Object.keys(filters).filter(k => filters[k] !== null && k !== 'search').length + (searchText.trim() ? 1 : 0);

  return (
    <Modal animationType="slide" transparent visible={isVisible} onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="chevron-down" size={24} color="#666" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Bộ lọc & Tìm kiếm</Text>
            <TouchableOpacity onPress={handleReset} style={styles.resetButton}>
              <Text style={styles.resetText}>Đặt lại</Text>
            </TouchableOpacity>
          </View>

          {/* Filter Content */}
          <ScrollView contentContainerStyle={styles.filterContent} showsVerticalScrollIndicator={false}>
            {/* Search */}
            <View style={styles.searchSection}>
              <View style={styles.searchContainer}>
                <Ionicons name="search-outline" size={20} color="#868e96" style={styles.searchIcon} />
                <TextInput
                  placeholder="Tìm kiếm hoạt động..."
                  value={searchText}
                  onChangeText={handleSearchChange}
                  style={styles.searchInput}
                  placeholderTextColor="#868e96"
                />
                {searchText.length > 0 && (
                  <TouchableOpacity onPress={() => setSearchText('')} style={styles.clearSearchButton}>
                    <Ionicons name="close-circle" size={20} color="#868e96" />
                  </TouchableOpacity>
                )}
              </View>
            </View>

            {/* Status */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Ionicons name="flag-outline" size={20} color="#3f2b96" />
                <Text style={styles.sectionTitle}>Tình trạng tham gia</Text>
              </View>
              <View style={styles.pillContainer}>
                {filterOptions.status.map(status => (
                  <FilterPill key={status} category="status" value={status} />
                ))}
              </View>
            </View>

            {/* Organization */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Ionicons name="business-outline" size={20} color="#3f2b96" />
                <Text style={styles.sectionTitle}>Đơn vị tổ chức</Text>
              </View>
              <View style={styles.pillContainer}>
                {orgUnits.map(org => (
                  <FilterPill key={org._id} category="organization" value={org.name} />
                ))}
              </View>
            </View>

            {/* Field */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Ionicons name="grid-outline" size={20} color="#3f2b96" />
                <Text style={styles.sectionTitle}>Lĩnh vực</Text>
              </View>
              <View style={styles.pillContainer}>
                {filterOptions.field.map(field => (
                  <FilterPill key={field} category="field" value={field} />
                ))}
              </View>
            </View>
          </ScrollView>

          {/* Footer */}
          <View style={styles.footer}>
            <TouchableOpacity
              style={[styles.applyButton, getSelectedCount() === 0 && styles.applyButtonDisabled]}
              onPress={handleApply}
              disabled={getSelectedCount() === 0}
            >
              <Text style={styles.applyText}>
                Áp dụng {getSelectedCount() > 0 && `(${getSelectedCount()})`}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  container: { backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24, maxHeight: '85%', shadowColor: '#000', shadowOffset: { width: 0, height: -4 }, shadowOpacity: 0.1, shadowRadius: 12, elevation: 8 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: '#f1f3f5' },
  closeButton: { padding: 4, width: 40 },
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#343a40' },
  resetButton: { padding: 8 },
  resetText: { color: '#3f2b96', fontSize: 16, fontWeight: '600' },
  filterContent: { padding: 20 },
  searchSection: { marginBottom: 24 },
  searchContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f8f9fa', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 12, borderWidth: 2, borderColor: '#e9ecef' },
  searchIcon: { marginRight: 12 },
  searchInput: { flex: 1, fontSize: 16, color: '#343a40', padding: 0 },
  clearSearchButton: { padding: 4 },
  section: { marginBottom: 28 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  sectionTitle: { fontSize: 16, fontWeight: '600', color: '#343a40', marginLeft: 12 },
  pillContainer: { flexDirection: 'row', flexWrap: 'wrap' },
  pill: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 20, backgroundColor: '#f8f9fa', borderWidth: 2, borderColor: '#e9ecef', marginRight: 12, marginBottom: 12 },
  pillSelected: { backgroundColor: '#3f2b96', borderColor: '#3f2b96' },
  pillText: { color: '#495057', fontSize: 14, fontWeight: '500' },
  pillTextSelected: { color: 'white', fontWeight: '600' },
  pillIcon: { marginLeft: 6 },
  footer: { padding: 20, borderTopWidth: 1, borderTopColor: '#f1f3f5', backgroundColor: 'white' },
  applyButton: { backgroundColor: '#3f2b96', paddingVertical: 16, borderRadius: 12, justifyContent: 'center', alignItems: 'center', shadowColor: '#3f2b96', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 4 },
  applyButtonDisabled: { backgroundColor: '#adb5bd', shadowOpacity: 0, elevation: 0 },
  applyText: { color: 'white', fontSize: 16, fontWeight: '700' },
});

export default FilterModal;
