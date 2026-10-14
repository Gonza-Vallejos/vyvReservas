import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Platform,
} from "react-native";
import { useThemeColor } from "../Themed";

export interface DataTableColumn<T> {
  key: string;
  label: string;
  width?: number;
  flex?: number;
  render?: (item: T) => React.ReactNode;
}

interface DataTableProps<T> {
  columns: DataTableColumn<T>[];
  data: T[];
  keyExtractor: (item: T) => string | number;
  emptyMessage?: string;
}

/**
 * Tabla de datos reutilizable.
 * En web usa layout flexible; en mobile usa scroll horizontal con anchos fijos.
 */
export default function DataTable<T>({
  columns,
  data,
  keyExtractor,
  emptyMessage = "No hay datos para mostrar.",
}: DataTableProps<T>) {
  const textSecondary = useThemeColor({}, "textSecondary");
  const primary = useThemeColor({}, "primary");
  const surface = useThemeColor({}, "surface");
  const border = useThemeColor({}, "border");

  if (data.length === 0) {
    return (
      <Text style={[styles.emptyText, { color: textSecondary }]}>
        {emptyMessage}
      </Text>
    );
  }

  const renderCell = (item: T, column: DataTableColumn<T>, isHeader: boolean) => {
    const content = column.render
      ? column.render(item)
      : (item as any)[column.key];

    const cellStyle = [
      styles.cell,
      { borderColor: border },
      column.width ? { width: column.width } : { flex: column.flex ?? 1 },
    ];

    return (
      <View key={column.key} style={cellStyle}>
        {isHeader ? (
          <Text style={[styles.headerText, { color: primary }]}>{column.label}</Text>
        ) : typeof content === "string" || typeof content === "number" ? (
          <Text style={[styles.cellText, { color: useThemeColor({}, "text") }]}>
            {content}
          </Text>
        ) : (
          content
        )}
      </View>
    );
  };

  const tableContent = (
    <View>
      <View style={[styles.headerRow, { backgroundColor: `${primary}10`, borderColor: border }]}>
        {columns.map((col) => renderCell({} as T, col, true))}
      </View>
      {data.map((item) => (
        <View
          key={keyExtractor(item)}
          style={[styles.row, { backgroundColor: surface, borderColor: border }]}
        >
          {columns.map((col) => renderCell(item, col, false))}
        </View>
      ))}
    </View>
  );

  if (Platform.OS === "web") {
    return <View style={styles.container}>{tableContent}</View>;
  }

  const totalWidth = columns.reduce(
    (acc, col) => acc + (col.width || 120),
    0
  );

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator>
      <View style={{ width: totalWidth }}>{tableContent}</View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
  },
  headerRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    paddingVertical: 10,
    borderRadius: 8,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
  },
  row: {
    flexDirection: "row",
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  cell: {
    paddingHorizontal: 10,
    justifyContent: "center",
  },
  headerText: {
    fontWeight: "bold",
    fontSize: 13,
  },
  cellText: {
    fontSize: 14,
  },
  emptyText: {
    textAlign: "center",
    marginTop: 24,
    fontSize: 16,
  },
});
