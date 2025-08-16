// Test script to verify Scrum Master member management permissions
// This script can be run with: node test-scrum-master-permissions.js

// Mock user data (similar to what would be in AuthContext)
const testCases = [
  {
    name: "Scrum Master as project member",
    user: {
      id: "user-4",
      role: "SCRUM_MASTER",
      name: "Alice Brown"
    },
    project: {
      id: "project-1",
      name: "HAZOP Implementation Project",
      ownerId: "user-2",
      members: [
        { user: { id: "user-4", name: "Alice Brown" } }, // Scrum Master is a member
        { user: { id: "user-6", name: "David Johnson" } }
      ]
    },
    expectedCanManage: true
  },
  {
    name: "Scrum Master NOT a project member",
    user: {
      id: "user-5",
      role: "SCRUM_MASTER",
      name: "Mike Wilson"
    },
    project: {
      id: "project-1",
      name: "HAZOP Implementation Project",
      ownerId: "user-2",
      members: [
        { user: { id: "user-4", name: "Alice Brown" } }, // Different Scrum Master
        { user: { id: "user-6", name: "David Johnson" } }
      ]
    },
    expectedCanManage: false
  },
  {
    name: "Project Owner",
    user: {
      id: "user-2",
      role: "PROJECT_OWNER",
      name: "John Doe"
    },
    project: {
      id: "project-1",
      name: "HAZOP Implementation Project",
      ownerId: "user-2",
      members: [
        { user: { id: "user-4", name: "Alice Brown" } }
      ]
    },
    expectedCanManage: true
  },
  {
    name: "Team Member",
    user: {
      id: "user-6",
      role: "TEAM_MEMBER",
      name: "David Johnson"
    },
    project: {
      id: "project-1",
      name: "HAZOP Implementation Project",
      ownerId: "user-2",
      members: [
        { user: { id: "user-6", name: "David Johnson" } } // Team member is a member
      ]
    },
    expectedCanManage: false
  }
];

// Permission logic function (copied from AuthContext)
function canManageProjectMembers(user, projectOwnerId, project = null) {
  if (!user) return false;
  if (user.role === "SUPERADMIN") return true;
  if (user.role === "PROJECT_OWNER" && user.id === projectOwnerId) return true;
  
  // Allow Scrum Master if they are a member of the project
  if (user.role === "SCRUM_MASTER" && project) {
    // Check if user is the project owner
    if (project.ownerId === user.id) return true;
    
    // Check if user is a member of the project
    if (Array.isArray(project.members)) {
      // If array of userId (simple array)
      if (project.members.length > 0 && typeof project.members[0] === "string") {
        return project.members.includes(user.id);
      } else {
        // If array of member objects (from backend API)
        // Check for member objects with user property (from API response)
        if (project.members.some(m => m.user && m.user.id === user.id)) return true;
        // Check for direct user objects (from some API responses)
        if (project.members.some(m => m.id === user.id)) return true;
        // Check for membership objects with userId property
        if (project.members.some(m => m.userId === user.id)) return true;
      }
    }
  }
  
  return false;
}

// Run tests
console.log("🧪 Testing Scrum Master Member Management Permissions\n");

testCases.forEach((testCase, index) => {
  const result = canManageProjectMembers(testCase.user, testCase.project.ownerId, testCase.project);
  const passed = result === testCase.expectedCanManage;
  
  console.log(`Test ${index + 1}: ${testCase.name}`);
  console.log(`  User: ${testCase.user.name} (${testCase.user.role})`);
  console.log(`  Project: ${testCase.project.name}`);
  console.log(`  Expected: ${testCase.expectedCanManage}, Got: ${result}`);
  console.log(`  Result: ${passed ? "✅ PASSED" : "❌ FAILED"}`);
  console.log("");
});

console.log("📋 Summary:");
const passedTests = testCases.filter((testCase) => 
  canManageProjectMembers(testCase.user, testCase.project.ownerId, testCase.project) === testCase.expectedCanManage
);
console.log(`✅ Passed: ${passedTests.length}/${testCases.length}`);
console.log(`❌ Failed: ${testCases.length - passedTests.length}/${testCases.length}`);

if (passedTests.length === testCases.length) {
  console.log("\n🎉 All tests passed! Scrum Master member management permissions are working correctly.");
} else {
  console.log("\n⚠️  Some tests failed. Please check the permission logic.");
}
