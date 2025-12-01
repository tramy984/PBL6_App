import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import {
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import { getAllFaculties } from '../services/faculty';
import { getAllFields } from '../services/Field';
import { getAllOrgUnits } from '../services/Org';

interface OrgUnit {
  _id: string;
  name: string;
  type: 'faculty' | 'organization';
}

interface Field {
  _id: string;
  name: string;
}

interface FilterModalProps {
  isVisible: boolean;
  onClose: () => void;
  onApply: (filters: Record<string, string | null>) => void;
  initialFilters: Record<string, string | null>;
}

const statusOptions = ['Đã đăng ký', 'Đã được duyệt', 'Đã từ chối', 'Đã tham gia'];

export default function FilterModal({
  isVisible,
  onClose,
  onApply,
  initialFilters,
}: FilterModalProps) {
  const [filters, setFilters] = useState(initialFilters);

  // searchText chính là title theo API
  const [searchText, setSearchText] = useState(initialFilters.title || '');

  const [fields, setFields] = useState<Field[]>([]);
  const [orgUnits, setOrgUnits] = useState<OrgUnit[]>([]);

  const fetchData = async () => {
    try {
      const [fieldRes, facultyRes, orgRes] = await Promise.all([
        getAllFields(),
        getAllFaculties(),
        getAllOrgUnits(),
      ]);

      if (fieldRes.success && fieldRes.data) {
        setFields(fieldRes.data);
      }

      const merged: OrgUnit[] = [];

      if (facultyRes.success && facultyRes.data) {
        facultyRes.data.forEach((f: any) =>
          merged.push({
            _id: f._id,
            name: f.name,
            type: 'faculty',
          }),
        );
      }

      if (orgRes.success && orgRes.data) {
        orgRes.data.forEach((o: any) =>
          merged.push({
            _id: o._id,
            name: o.name,
            type: 'organization',
          }),
        );
      }

      setOrgUnits(merged);
    } catch (err) {
      console.error('[FilterModal] Fetch error:', err);
    }
  };

  useEffect(() => {
    if (isVisible) {
      setFilters(initialFilters);
      setSearchText(initialFilters.title || '');
      fetchData();
    }
  }, [isVisible]);

  const handleSelect = (key: string, value: string) => {
    setFilters((prev) => ({
      ...prev,
      [key]: prev[key] === value ? null : value,
    }));
  };

  const handleApply = () => {
    onApply({
      status: filters.status || null,
      org_unit_id: filters.org_unit_id || null,
      field_id: filters.field_id || null,
      title: searchText || null,
    });
    onClose();
  };

  const handleReset = () => {
    onApply({
      status: null,
      org_unit_id: null,
      field_id: null,
      title: null,
    });

    setFilters({});
    setSearchText('');
    onClose();
  };

  return (
    <Modal visible={isVisible} transparent animationType="slide">
      <View style={styles.overlay}>
        <View style={styles.modalBox}>
          {/* HEADER */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Bộ lọc</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={26} color="#444" />
            </TouchableOpacity>
          </View>

          <ScrollView style={{ paddingHorizontal: 16 }}>

            {/* SEARCH / TITLE */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Tìm kiếm</Text>
              <TextInput
                style={styles.input}
                placeholder="Nhập từ khóa..."
                value={searchText}
                onChangeText={setSearchText}
              />
            </View>

            {/* STATUS */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Trạng thái</Text>
              <View style={styles.pillContainer}>
                {statusOptions.map((s) => (
                  <TouchableOpacity
                    key={s}
                    style={[
                      styles.pill,
                      filters.status === s && styles.pillActive,
                    ]}
                    onPress={() => handleSelect('status', s)}
                  >
                    <Text
                      style={[
                        styles.pillText,
                        filters.status === s && styles.pillTextActive,
                      ]}
                    >
                      {s}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* FIELD */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Lĩnh vực</Text>
              <View style={styles.pillContainer}>
                {fields.map((f) => (
                  <TouchableOpacity
                    key={f._id}
                    style={[
                      styles.pill,
                      filters.field_id === f._id && styles.pillActive,
                    ]}
                    onPress={() => handleSelect('field_id', f._id)}
                  >
                    <Text
                      style={[
                        styles.pillText,
                        filters.field_id === f._id && styles.pillTextActive,
                      ]}
                    >
                      {f.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* ORG UNITS */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Khoa / Tổ chức</Text>
              <View style={styles.pillContainer}>
                {orgUnits.map((u) => (
                  <TouchableOpacity
                    key={u._id}
                    style={[
                      styles.pill,
                      filters.org_unit_id === u._id && styles.pillActive,
                    ]}
                    onPress={() => handleSelect('org_unit_id', u._id)}
                  >
                    <Text
                      style={[
                        styles.pillText,
                        filters.org_unit_id === u._id && styles.pillTextActive,
                      ]}
                    >
                      {u.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </ScrollView>

          {/* FOOTER */}
          <View style={styles.footer}>
            <TouchableOpacity style={styles.resetBtn} onPress={handleReset}>
              <Text style={styles.resetText}>Đặt lại</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.applyBtn} onPress={handleApply}>
              <Text style={styles.applyText}>Áp dụng</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
    justifyContent: 'flex-end',
  },
  modalBox: {
    height: '82%',
    backgroundColor: '#fff',
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    paddingTop: 14,
  },
  header: {
    paddingHorizontal: 16,
    paddingBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderColor: '#eee',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },

  section: {
    marginVertical: 14,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },

  input: {
    padding: 12,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
  },

  pillContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  pill: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#ccc',
  },
  pillActive: {
    backgroundColor: '#3f2b96',
    borderColor: '#3f2b96',
  },
  pillText: {
    color: '#333',
  },
  pillTextActive: {
    color: '#fff',
  },

  footer: {
    flexDirection: 'row',
    padding: 16,
    borderTopWidth: 1,
    borderColor: '#eee',
  },

  resetBtn: {
    flex: 1,
    padding: 14,
    backgroundColor: '#eee',
    borderRadius: 10,
    alignItems: 'center',
  },
  resetText: {
    color: '#444',
  },

  applyBtn: {
    flex: 1,
    marginLeft: 10,
    padding: 14,
    backgroundColor: '#3f2b96',
    borderRadius: 10,
    alignItems: 'center',
  },
  applyText: {
    color: '#fff',
    fontWeight: '600',
  },
});
