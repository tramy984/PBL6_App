import { Redirect } from "expo-router";

export default function Index() {
  // Khi app mở, tự động chuyển đến login
  return <Redirect href="/login" />;
}
