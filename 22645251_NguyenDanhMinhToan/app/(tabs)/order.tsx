import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import { FlatList, Text, TouchableOpacity, View } from "react-native";
import { listOrders } from "../../src/db/orders.repo";
import { Order } from "../../src/models/types";

export default function OrderScreen() {
  const [orders, setOrders] = useState<Order[]>([]);
  const router = useRouter();

  useFocusEffect(
    useCallback(() => {
      listOrders().then(setOrders);
    }, [])
  );

  return (
    <View style={{ flex: 1, padding: 16 }}>
      <Text style={{ fontSize: 22, fontWeight: "700", marginBottom: 12 }}>
        Danh sách hoá đơn
      </Text>

      <FlatList
        data={orders}
        keyExtractor={(i) => i.id.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              backgroundColor: "#fff",
              padding: 14,
              borderRadius: 10,
              marginBottom: 10,
            }}
          >
            <View>
              <Text style={{ fontSize: 16, fontWeight: "600" }}>
                Đơn #{item.id}
              </Text>
              <Text style={{ fontSize: 13, color: "#555" }}>
                Ghi chú: {item.note || "Không có"}
              </Text>
              <Text style={{ fontSize: 12, color: "#777" }}>
                {item.created_at}
              </Text>
            </View>

            <Text style={{ color: "red", fontWeight: "700" }}>
              {(item.total ?? 0).toLocaleString()}₫
            </Text>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <Text style={{ textAlign: "center", marginTop: 40, color: "#666" }}>
            Chưa có hoá đơn.
          </Text>
        }
      />
    </View>
  );
}
