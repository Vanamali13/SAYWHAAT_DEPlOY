import apiClient from "../api/apiClient";

export async function getAdminStats() {
  // Get all users
  const { data: users } = await apiClient.get("/users");
  // Get all donations
  const { data: donations } = await apiClient.get("/donations");

  // Filter users by role
  const donors = users.filter(u => u.role === "Donor");
  const batchStaff = users.filter(u => u.role === "Batch staff");

  // Active = has logged in or created? For now, count all
  const activeDonors = donors.length;
  const activeBatchStaff = batchStaff.length;

  // Batches to be assigned = donations with status 'pending'
  const toBeAssigned = donations.filter(d => d.status === "pending").length;
  // Delivered = 'delivered' or 'confirmed'
  const delivered = donations.filter(d => d.status === "delivered" || d.status === "confirmed").length;
  // Ongoing = 'in_transit'
  const ongoing = donations.filter(d => d.status === "in_transit").length;

  return {
    activeDonors,
    activeBatchStaff,
    toBeAssigned,
    delivered,
    ongoing,
  };
}

export async function getUsersByRole(role) {
  const { data: users } = await apiClient.get("/users");
  return users.filter(u => u.role === role);
}

export async function getDonorDetails(id) {
  const { data } = await apiClient.get(`/admin/donors/${id}`);
  return data;
}

export async function getStaffDetails(id) {
  const { data } = await apiClient.get(`/admin/staff/${id}`);
  return data;
}
