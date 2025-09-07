import { useEffect, useState } from "react";
import { User, Shield, Search, Trash2, Edit } from "lucide-react";
import { collection, getDocs, doc, updateDoc, deleteDoc } from "firebase/firestore";
import { db } from "../firebaseConfig";
import { useAuth } from "../AuthContext";

const ManageUsers = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<any[]>([]);
  const [selectedUser, setSelectedUser] = useState<any | null>(null);
  const [search, setSearch] = useState("");
  const { user } = useAuth();

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const snapshot = await getDocs(collection(db, "users"));
        const userList = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
        setUsers(userList);
        setFilteredUsers(userList);
      } catch (err) {
        console.error("Error fetching users:", err);
      }
    };

    fetchUsers();
  }, []);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toLowerCase();
    setSearch(value);
    setFilteredUsers(
      users.filter(
        (u) =>
          u.fullName.toLowerCase().includes(value) ||
          u.email.toLowerCase().includes(value)
      )
    );
  };

  const changeRole = async (uid: string, newRole: string) => {
    try {
      await updateDoc(doc(db, "users", uid), { role: newRole });
      setUsers((prev) =>
        prev.map((u) => (u.id === uid ? { ...u, role: newRole } : u))
      );
      if (selectedUser?.id === uid) {
        setSelectedUser({ ...selectedUser, role: newRole });
      }
    } catch (err) {
      console.error("Error updating role:", err);
    }
  };

  const deleteUser = async (uid: string) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;
    try {
      await deleteDoc(doc(db, "users", uid));
      setUsers((prev) => prev.filter((u) => u.id !== uid));
      setFilteredUsers((prev) => prev.filter((u) => u.id !== uid));
      if (selectedUser?.id === uid) {
        setSelectedUser(null);
      }
    } catch (err) {
      console.error("Error deleting user:", err);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="relative bg-navy text-white overflow-hidden">
        <div className="absolute inset-0 z-0 pointer-events-none">
          <div className="absolute bg-blue-600 opacity-60 rounded-full w-[280px] h-[280px] top-[-60px] left-[-80px] blur-3xl"></div>
          <div className="absolute bg-victory-green opacity-70 rounded-full w-[200px] h-[200px] bottom-[-50px] right-[-70px] blur-2xl"></div>
        </div>
        <div className="relative z-10 py-10 text-center px-4 sm:px-6 lg:px-8">
          <Shield className="w-10 h-10 mx-auto mb-3 text-white/90" />
          <h1 className="text-3xl md:text-4xl font-bold mb-2">Manage Users</h1>
          <p className="text-base md:text-lg opacity-80 max-w-2xl mx-auto">
            View, edit roles, or remove users from the system
          </p>
        </div>
      </div>

      {/* Main Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Left: User List */}
        <div className="bg-white rounded-xl shadow-md p-6 flex flex-col">
          <div className="flex items-center border rounded-lg px-3 py-2 mb-4">
            <Search className="w-5 h-5 text-gray-400 mr-2" />
            <input
              type="text"
              value={search}
              onChange={handleSearch}
              placeholder="Search users..."
              className="flex-1 outline-none"
            />
          </div>

          <div className="overflow-y-auto max-h-[500px] space-y-2">
            {filteredUsers.map((u) => (
              <div
                key={u.id}
                onClick={() => setSelectedUser(u)}
                className={`p-3 rounded-lg cursor-pointer flex items-center justify-between transition-colors ${
                  selectedUser?.id === u.id
                    ? "bg-blue-50 border border-blue-200"
                    : "hover:bg-gray-100"
                }`}
              >
                <div>
                  <p className="font-semibold">{u.fullName}</p>
                  <p className="text-sm text-gray-500">{u.email}</p>
                </div>
                <span
                  className={`px-2 py-1 rounded-full text-xs font-medium ${
                    u.role === "admin"
                      ? "bg-purple-100 text-purple-700"
                      : "bg-gray-100 text-gray-700"
                  }`}
                >
                  {u.role}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Right: User Details */}
        <div className="bg-white rounded-xl shadow-md p-6">
          {selectedUser ? (
            <>
              <div className="flex items-center space-x-4 mb-6">
                <User className="w-12 h-12 text-gray-400" />
                <div>
                  <h2 className="text-2xl font-bold">{selectedUser.fullName}</h2>
                  <p className="text-gray-600">{selectedUser.email}</p>
                </div>
              </div>

              <div className="mb-4 ml-4 text-gray-500 space-y-2">
                <p><span className="font-semibold">Full Name:</span> {selectedUser.fullName}</p>
                <p><span className="font-semibold">Email:</span> {selectedUser.email}</p>
                <p><span className="font-semibold">Created At:</span> {new Date(selectedUser.createdAt?.seconds * 1000).toLocaleString()}</p>
              </div>

              <div className="mb-6 ml-4 mt-3">
                <p>
                  <span className="font-semibold">Role:</span>{" "}
                  <span
                    className={`px-3 py-2 rounded-full text-sm font-medium ${
                      selectedUser.role === "admin"
                        ? "bg-purple-100 text-purple-700"
                        : "bg-gray-100 text-gray-700"
                    }`}
                  >
                    {selectedUser.role}
                  </span>
                </p>
              </div>
            </>
          ) : (
            <p className="text-gray-500">Select a user from the list to view details</p>
          )}

            <div className="flex space-x-3 mt-4 ml-4">
            <button
                onClick={() => {
                if (
                    window.confirm(
                    `Are you sure you want to change ${selectedUser.fullName}'s role from ${selectedUser.role} to ${
                        selectedUser.role === "admin" ? "user" : "admin"
                    }?`
                    )
                ) {
                    changeRole(
                    selectedUser.id,
                    selectedUser.role === "admin" ? "user" : "admin"
                    );
                }
                }}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
                <Edit className="w-4 h-4 mr-2" />
                Change Role
            </button>

            <button
                onClick={() => deleteUser(selectedUser.id)}
                className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
            </button>
            </div>

        </div>
      </div>
    </div>
  );
};

export default ManageUsers;
