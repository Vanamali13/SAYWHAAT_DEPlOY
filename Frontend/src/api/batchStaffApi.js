import apiClient from "../api/apiClient";

export async function getBatchStats() {
  // Get all donations for this batch staff (assigned to them)
  // For now, we assume all donations are visible; in a real app, filter by batch staff id
  const { data } = await apiClient.get("/donations");
  const now = new Date();
  const thisMonth = now.getMonth();
  const thisYear = now.getFullYear();

  let assignedThisMonth = 0;
  let delivered = 0;
  let ongoing = 0;

  data.forEach((donation) => {
    const created = new Date(donation.createdAt || donation.created_at || donation.created_date || donation.timestamp || donation.updatedAt || 0);
    if (
      created.getMonth() === thisMonth &&
      created.getFullYear() === thisYear
    ) {
      assignedThisMonth++;
    }
    if (donation.status === "delivered" || donation.status === "confirmed") {
      delivered++;
    } else if (donation.status === "in_transit" || donation.status === "pending") {
      ongoing++;
    }
  });

  return {
    assignedThisMonth,
    delivered,
    ongoing,
  };
}
