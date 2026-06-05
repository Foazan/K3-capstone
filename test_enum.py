import enum

class UserRole(str, enum.Enum):
    ADMIN = "admin"
    MANAGER = "manager"

print(UserRole.ADMIN == "admin")
print(UserRole.ADMIN != "admin")
print(UserRole.ADMIN.value == "admin")
