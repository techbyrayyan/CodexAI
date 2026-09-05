export interface MemoryRecord {
  id: string;
  userId?: string;
  category: "fact" | "preference" | "context" | "task" | "code_snippet";
  content: string;
  embedding?: number[];
  importance: number; // 0 to 1
  createdAt: number;
  lastAccessedAt: number;
}

export interface MemoryQuery {
  text: string;
  limit?: number;
  category?: MemoryRecord["category"];
  minImportance?: number;
}

export interface MemoryProvider {
  store(record: Omit<MemoryRecord, "id" | "createdAt" | "lastAccessedAt">): Promise<MemoryRecord>;
  recall(query: MemoryQuery): Promise<MemoryRecord[]>;
  forget(id: string): Promise<boolean>;
}
