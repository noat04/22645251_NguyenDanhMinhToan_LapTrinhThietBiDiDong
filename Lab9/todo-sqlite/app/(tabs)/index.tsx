import { Feather, Ionicons, MaterialIcons } from "@expo/vector-icons";
import {
  SQLiteProvider,
  useSQLiteContext,
  type SQLiteDatabase,
} from "expo-sqlite";
import { useCallback, useEffect, useState } from "react";
import {
  Image,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

interface ItemEntity {
  id: number;
  title: string;
  done: number; // 0 | 1
  created_at?: string;
  updated_at?: string;
}


export default function App() {
  return (
    <SQLiteProvider databaseName="huy.db" onInit={migrateDbIfNeeded}>
      <Main />
    </SQLiteProvider>
  );
}

function Main() {
  const db = useSQLiteContext();

  const [search, setSearch] = useState("");
  const [todos, setTodos] = useState<ItemEntity[]>([]);
  const [dones, setDones] = useState<ItemEntity[]>([]);

  // modal state
  const [modalVisible, setModalVisible] = useState(false);
  const [editing, setEditing] = useState<ItemEntity | null>(null);
  const [draftTitle, setDraftTitle] = useState("");

  const openAdd = () => {
    setEditing(null);
    setDraftTitle("");
    setModalVisible(true);
  };
  const openEdit = (item: ItemEntity) => {
    setEditing(item);
    setDraftTitle(item.title);
    setModalVisible(true);
  };
  const closeModal = () => setModalVisible(false);

  const refetch = useCallback(async () => {
    await db.withExclusiveTransactionAsync(async () => {
      const t: ItemEntity[] = await db.getAllAsync(
        "SELECT * FROM items WHERE done = 0 ORDER BY id DESC"
      );
      const d: ItemEntity[] = await db.getAllAsync(
        "SELECT * FROM items WHERE done = 1 ORDER BY updated_at DESC, id DESC"
      );
      setTodos(t);
      setDones(d);
    });
  }, [db]);

  useEffect(() => {
    refetch();
  }, []);

  // search filter (client-side)
  const normalized = (s: string) => s.toLowerCase().trim();
  const fTodos = todos.filter((i) => normalized(i.title).includes(normalized(search)));
  const fDones = dones.filter((i) => normalized(i.title).includes(normalized(search)));

  // CRUD handlers
  const handleSave = async () => {
    const text = draftTitle.trim();
    if (!text) return;

    if (editing) {
      await updateItemAsync(db, editing.id, text);
    } else {
      await addItemAsync(db, text);
    }
    closeModal();
    await refetch();
  };

  const toggleDone = async (item: ItemEntity) => {
    if (item.done) {
      await markUndoneAsync(db, item.id);
    } else {
      await markDoneAsync(db, item.id);
    }
    await refetch();
  };

  const remove = async (id: number) => {
    await deleteItemAsync(db, id);
    await refetch();
  };

  return (
    <View style={styles.container}>
      {/* Top bar */}
      <View style={styles.topBar}>
        <TouchableOpacity hitSlop={8}>
          <Ionicons name="chevron-back" size={22} />
        </TouchableOpacity>

        <View style={styles.userRow}>
          <Image
            source={{
              uri:
                "https://i.pravatar.cc/100?img=5",
            }}
            style={styles.avatar}
          />
          <View>
            <Text style={styles.hiText}>Hi Twinkle</Text>
            <Text style={styles.subText}>Have a great day ahead</Text>
          </View>
        </View>

        <View style={{ width: 22 }} />
      </View>

      {/* Search */}
      <View style={styles.searchWrap}>
        <Ionicons name="search" size={18} />
        <TextInput
          placeholder="Search"
          value={search}
          onChangeText={setSearch}
          style={styles.searchInput}
          returnKeyType="search"
        />
      </View>

      {/* Lists */}
      <ScrollView style={styles.listArea} contentContainerStyle={{ paddingBottom: 120 }}>
        <Section title="Todo">
          {fTodos.map((item) => (
            <TaskCard
              key={item.id}
              item={item}
              onToggle={() => toggleDone(item)}
              onEdit={() => openEdit(item)}
              onDelete={() => remove(item.id)}
            />
          ))}
          {fTodos.length === 0 && <Empty text="No tasks to do." />}
        </Section>

        <Section title="Completed">
          {fDones.map((item) => (
            <TaskCard
              key={item.id}
              item={item}
              onToggle={() => toggleDone(item)}
              onEdit={() => openEdit(item)}
              onDelete={() => remove(item.id)}
            />
          ))}
          {fDones.length === 0 && <Empty text="No completed tasks." />}
        </Section>
      </ScrollView>

      {/* Floating Add */}
      <Pressable style={styles.fab} onPress={openAdd}>
        <Ionicons name="add" size={28} color="#fff" />
      </Pressable>

      {/* Add/Edit Modal */}
      <Modal
        transparent
        animationType="slide"
        visible={modalVisible}
        onRequestClose={closeModal}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>
              {editing ? "Edit task" : "Add new task"}
            </Text>
            <TextInput
              value={draftTitle}
              onChangeText={setDraftTitle}
              placeholder="Task title"
              style={styles.modalInput}
              autoFocus
            />
            <View style={styles.modalActions}>
              <Pressable style={[styles.btn, styles.btnGhost]} onPress={closeModal}>
                <Text style={[styles.btnText, { color: "#333" }]}>Cancel</Text>
              </Pressable>
              <Pressable style={[styles.btn, styles.btnPrimary]} onPress={handleSave}>
                <Text style={[styles.btnText, { color: "#fff" }]}>
                  {editing ? "Save" : "Add"}
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

/* ---------- UI Pieces ---------- */

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {children}
    </View>
  );
}

function Empty({ text }: { text: string }) {
  return (
    <View style={{ paddingVertical: 8, paddingHorizontal: 8 }}>
      <Text style={{ color: "#7b7b7b" }}>{text}</Text>
    </View>
  );
}

function TaskCard({
  item,
  onToggle,
  onEdit,
  onDelete,
}: {
  item: ItemEntity;
  onToggle: () => void | Promise<void>;
  onEdit: () => void;
  onDelete: () => void | Promise<void>;
}) {
  return (
    <View style={styles.card}>
      <Pressable style={styles.checkbox} onPress={onToggle}>
        {item.done ? (
          <Ionicons name="checkmark" size={16} color="#fff" />
        ) : (
          <View style={styles.checkboxInner} />
        )}
      </Pressable>

      <Text
        style={[
          styles.cardText,
          item.done ? styles.cardTextDone : undefined,
        ]}
        numberOfLines={2}
      >
        {item.title}
      </Text>

      {/* optional small red tag like screenshot */}
      {item.done === 0 && <View style={styles.smallRed} />}

      <View style={{ flexDirection: "row", gap: 6 }}>
        <Pressable onPress={onEdit} hitSlop={8} style={styles.iconBtn}>
          <Feather name="edit-2" size={16} color="#8b8b8b" />
        </Pressable>
        <Pressable onPress={onDelete} hitSlop={8} style={styles.iconBtn}>
          <MaterialIcons name="delete-outline" size={18} color="#8b8b8b" />
        </Pressable>
      </View>
    </View>
  );
}

/* ---------- DB helpers ---------- */

async function addItemAsync(db: SQLiteDatabase, title: string): Promise<void> {
  await db.runAsync(
    "INSERT INTO items (title, done, created_at, updated_at) VALUES (?, 0, strftime('%Y-%m-%d %H:%M:%f','now'), strftime('%Y-%m-%d %H:%M:%f','now'));",
    title
  );
}

async function updateItemAsync(
  db: SQLiteDatabase,
  id: number,
  title: string
): Promise<void> {
  await db.runAsync(
    "UPDATE items SET title = ?, updated_at = strftime('%Y-%m-%d %H:%M:%f','now') WHERE id = ?;",
    title,
    id
  );
}

async function markDoneAsync(db: SQLiteDatabase, id: number): Promise<void> {
  await db.runAsync(
    "UPDATE items SET done = 1, updated_at = strftime('%Y-%m-%d %H:%M:%f','now') WHERE id = ?;",
    id
  );
}

async function markUndoneAsync(db: SQLiteDatabase, id: number): Promise<void> {
  await db.runAsync(
    "UPDATE items SET done = 0, updated_at = strftime('%Y-%m-%d %H:%M:%f','now') WHERE id = ?;",
    id
  );
}

async function deleteItemAsync(db: SQLiteDatabase, id: number): Promise<void> {
  await db.runAsync("DELETE FROM items WHERE id = ?;", id);
}

async function migrateDbIfNeeded(db: SQLiteDatabase) {
  const DATABASE_VERSION = 3;

  const result = await db.getFirstAsync<{ user_version: number }>(
    "PRAGMA user_version"
  );
  let user_version = result?.user_version ?? 0;

  if (user_version >= DATABASE_VERSION) return;

  await db.execAsync(`PRAGMA journal_mode = wal;`);

  if (user_version === 0) {
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS items (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        done INTEGER NOT NULL DEFAULT 0,
        created_at TEXT,
        updated_at TEXT
      );
    `);
    user_version = 1;
  }

  if (user_version === 1) {
    const tableInfo = await db.getAllAsync<{ name: string }>(
      "PRAGMA table_info(items)"
    );
    const columnNames = tableInfo.map((col) => col.name);

    if (!columnNames.includes("created_at")) {
      await db.execAsync(
        "ALTER TABLE items ADD COLUMN created_at TEXT DEFAULT (strftime('%Y-%m-%d %H:%M:%f','now'));"
      );
    }

    if (!columnNames.includes("updated_at")) {
      await db.execAsync(
        "ALTER TABLE items ADD COLUMN updated_at TEXT DEFAULT (strftime('%Y-%m-%d %H:%M:%f','now'));"
      );
    }

    if (columnNames.includes("value") && !columnNames.includes("title")) {
      await db.execAsync(`
        ALTER TABLE items ADD COLUMN title TEXT;
        UPDATE items SET title = value WHERE title IS NULL;
      `);
    }

    user_version = 2;
  }

  if (user_version === 2) {
    user_version = 3;
  }

  await db.execAsync(`PRAGMA user_version = ${DATABASE_VERSION}`);
}

/* ---------- Styles ---------- */

const shadow =
  Platform.OS === "ios"
    ? {
      shadowColor: "#000",
      shadowOpacity: 0.08,
      shadowRadius: 8,
      shadowOffset: { width: 0, height: 4 },
    }
    : { elevation: 2 };

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
    paddingTop: 36,
  },

  /* Top */
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    justifyContent: "space-between",
  },
  userRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  avatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: "#eee" },
  hiText: { fontSize: 18, fontWeight: "700" },
  subText: { color: "#666", marginTop: 2 },

  /* Search */
  searchWrap: {
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e6e6e6",
    paddingHorizontal: 12,
    height: 44,
    alignItems: "center",
    flexDirection: "row",
    gap: 8,
    backgroundColor: "#fff",
  },
  searchInput: { flex: 1 },

  listArea: { marginTop: 12 },

  section: { marginTop: 8, paddingHorizontal: 16, gap: 8 },
  sectionTitle: { fontSize: 16, fontWeight: "700", marginVertical: 8 },

  /* Task card */
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    ...shadow,
  },
  cardText: { flex: 1, fontSize: 15, color: "#111" },
  cardTextDone: { color: "#6b7280", textDecorationLine: "line-through" },

  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#39c07f",
  },
  checkboxInner: {
    width: 14,
    height: 14,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: "#9ca3af",
    backgroundColor: "#fff",
  },

  smallRed: {
    width: 28,
    height: 12,
    borderRadius: 3,
    backgroundColor: "#ef4444",
    marginRight: 6,
  },

  iconBtn: {
    width: 28,
    height: 28,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f5f5f5",
  },

  /* FAB */
  fab: {
    position: "absolute",
    right: 24,
    bottom: 28,
    width: 62,
    height: 62,
    borderRadius: 31,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#1fb6ff",
    ...shadow,
  },

  /* Modal */
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.25)",
    justifyContent: "flex-end",
  },
  modalCard: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 16,
    gap: 12,
  },
  modalTitle: { fontSize: 18, fontWeight: "700" },
  modalInput: {
    borderWidth: 1,
    borderColor: "#e6e6e6",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
  },
  modalActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 10,
    marginTop: 8,
  },
  btn: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
  },
  btnPrimary: { backgroundColor: "#1fb6ff" },
  btnGhost: { backgroundColor: "#f3f4f6" },
  btnText: { fontWeight: "700" },
});