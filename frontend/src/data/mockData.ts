
// Mock data for development - replace with API calls later

export const mockProjects = {
  new: [
    {
      id: '1',
      title: 'Machine Learning Classifier',
      description: 'Develop a machine learning classifier for image recognition using TensorFlow and Python. This project involves data preprocessing, model training, and evaluation.',
      status: 'new' as const,
      course: 'CS 401 - Machine Learning',
      department: 'Computer Science',
      deadline: '2024-12-15',
      teamMembers: []
    },
    {
      id: '2',
      title: 'Web Application Development',
      description: 'Create a full-stack web application using React and Node.js for student management system with authentication and database integration.',
      status: 'new' as const,
      course: 'CS 350 - Web Development',
      department: 'Computer Science',
      deadline: '2024-11-30',
      teamMembers: []
    }
  ],
  active: [
    {
      id: '3',
      title: 'Database Design Project',
      description: 'Design and implement a normalized database schema for a library management system including all necessary relationships and constraints.',
      status: 'active' as const,
      course: 'CS 340 - Database Systems',
      department: 'Computer Science',
      deadline: '2024-12-01',
      teamMembers: [
        { name: 'Alice Johnson', avatar: '' },
        { name: 'Bob Smith', avatar: '' },
        { name: 'Carol Wilson', avatar: '' }
      ],
      progress: 65,
      tasks: {
        total: 5,
        completed: 3
      }
    }
  ],
  completed: [
    {
      id: '4',
      title: 'Algorithm Analysis',
      description: 'Comparative analysis of sorting algorithms including time complexity studies and performance benchmarking across different data sizes.',
      status: 'completed' as const,
      course: 'CS 320 - Algorithms',
      department: 'Computer Science',
      deadline: '2024-10-15',
      teamMembers: [
        { name: 'David Brown', avatar: '' },
        { name: 'Eva Davis', avatar: '' }
      ],
      progress: 100,
      tasks: {
        total: 4,
        completed: 4
      }
    }
  ],
  rejected: [
    {
      id: '5',
      title: 'AI Chatbot',
      description: 'This proposal was rejected due to insufficient technical detail in the implementation plan. Please revise and resubmit with more specific technical requirements.',
      status: 'rejected' as const,
      course: 'CS 401 - Machine Learning',
      department: 'Computer Science',
      deadline: '2024-12-20',
      teamMembers: [
        { name: 'Frank Miller', avatar: '' }
      ]
    }
  ]
};

export const mockCourses = [
  {
    id: '1',
    name: 'CS 401 - Machine Learning',
    department: 'Computer Science',
    teacher: 'Dr. Sarah Johnson',
    students: 45,
    projects: 3
  },
  {
    id: '2',
    name: 'CS 350 - Web Development',
    department: 'Computer Science',
    teacher: 'Prof. Michael Chen',
    students: 38,
    projects: 2
  },
  {
    id: '3',
    name: 'CS 340 - Database Systems',
    department: 'Computer Science',
    teacher: 'Dr. Emily Rodriguez',
    students: 42,
    projects: 4
  }
];

export const mockDepartments = [
  {
    id: '1',
    name: 'Computer Science',
    courses: 12,
    teachers: 8,
    students: 245
  },
  {
    id: '2',
    name: 'Information Technology',
    courses: 10,
    teachers: 6,
    students: 180
  },
  {
    id: '3',
    name: 'Software Engineering',
    courses: 8,
    teachers: 5,
    students: 160
  }
];

export const mockTasks = [
  {
    id: '1',
    title: 'Project Proposal',
    description: 'Submit a detailed project proposal including objectives, methodology, and timeline',
    deadline: '2024-11-01',
    weightage: 15,
    status: 'completed',
    submittedAt: '2024-10-28',
    grade: 85
  },
  {
    id: '2',
    title: 'Literature Review',
    description: 'Conduct comprehensive literature review and submit a 10-page report',
    deadline: '2024-11-15',
    weightage: 20,
    status: 'submitted',
    submittedAt: '2024-11-14'
  },
  {
    id: '3',
    title: 'Implementation Phase 1',
    description: 'Complete initial implementation of core features',
    deadline: '2024-11-30',
    weightage: 25,
    status: 'in_progress'
  },
  {
    id: '4',
    title: 'Testing & Documentation',
    description: 'Comprehensive testing and documentation of the implemented system',
    deadline: '2024-12-10',
    weightage: 20,
    status: 'pending'
  },
  {
    id: '5',
    title: 'Final Presentation',
    description: 'Present final project to evaluation committee',
    deadline: '2024-12-15',
    weightage: 20,
    status: 'pending'
  }
];
