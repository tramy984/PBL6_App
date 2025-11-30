import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export interface Event {
  id: string;
  name: string;
  org: string;
  start_time: string;
  end_time: string;
  location: string;
  status: string;
  img?: string;
}

interface EventCardProps {
  event: Event;
}

const Activity_Card: React.FC<EventCardProps> = ({ event }) => {
  const statusColor = "#3f2b96";

  return (
    <View style={styles.card}>
      {/* Hình ảnh */}
      {event.img ? (
        <Image source={{ uri: event.img }} style={styles.image} />
      ) : null}

      {/* Nội dung */}
      <View style={styles.infoContainer}>
        <View style={styles.titleRow}>
          <Text style={styles.title} numberOfLines={2}>
            {event.name}
          </Text>

          <Text style={[styles.statusTag, { backgroundColor: statusColor }]}>
            {event.status}
          </Text>
        </View>

        <Text style={styles.organization}>{event.org}</Text>

        <Text style={styles.detail}>
          Thời gian: {event.start_time} - {event.end_time}
        </Text>

        <Text style={styles.detail}>Địa điểm: {event.location}</Text>
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.detailButton}>
          <Text style={styles.detailButtonText}>Chi tiết</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    overflow: "hidden",
  },
  image: {
    width: "100%",
    height: 160,
    borderRadius: 10,
    marginBottom: 12,
  },
  infoContainer: {
    flex: 1,
  },
  titleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  title: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    flex: 1,
    marginRight: 8,
  },
  organization: {
    fontSize: 14,
    color: "#007BFF",
    marginBottom: 6,
    fontWeight: "500",
  },
  detail: {
    fontSize: 13,
    color: "#666",
    marginBottom: 4,
  },
  statusTag: {
    fontSize: 11,
    color: "white",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 5,
    fontWeight: "bold",
    minWidth: 70,
    textAlign: "center",
  },
  footer: {
    alignItems: "flex-end",
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#eee",
    marginTop: 12,
  },
  detailButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  detailButtonText: {
    color: "#007BFF",
    fontSize: 14,
    fontWeight: "600",
  },
});

export default Activity_Card;
