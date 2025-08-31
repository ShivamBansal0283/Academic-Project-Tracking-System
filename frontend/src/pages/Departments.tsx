import Layout from "@/components/layout/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { mockDepartments } from "@/data/mockData";
import { useDepartments } from "@/hooks/useApi";
import { Building, Users, BookOpen, GraduationCap } from "lucide-react";

const Departments = () => {
  const { data: departments, isLoading: departmentsLoading } = useDepartments();

  return (
    <Layout userRole="admin" userName="Admin User">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Departments</h1>
            <p className="text-muted-foreground mt-1">
              Overview of all university departments and their statistics.
            </p>
          </div>
          <Button className="bg-primary text-primary-foreground">
            <Building className="h-4 w-4 mr-2" />
            Add Department
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {mockDepartments.map((department) => (
            <Card key={department.id} className="hover:shadow-lg transition-shadow animate-fade-in">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <CardTitle className="text-xl">{department.name}</CardTitle>
                    <Badge variant="secondary">Department</Badge>
                  </div>
                  <Building className="h-6 w-6 text-primary" />
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div className="p-3 bg-muted/30 rounded-lg">
                    <div className="flex items-center justify-center mb-1">
                      <BookOpen className="h-4 w-4 text-primary" />
                    </div>
                    <p className="text-lg font-bold">{department.courses}</p>
                    <p className="text-xs text-muted-foreground">Courses</p>
                  </div>
                  
                  <div className="p-3 bg-muted/30 rounded-lg">
                    <div className="flex items-center justify-center mb-1">
                      <GraduationCap className="h-4 w-4 text-secondary" />
                    </div>
                    <p className="text-lg font-bold">{department.teachers}</p>
                    <p className="text-xs text-muted-foreground">Teachers</p>
                  </div>
                  
                  <div className="p-3 bg-muted/30 rounded-lg">
                    <div className="flex items-center justify-center mb-1">
                      <Users className="h-4 w-4 text-status-active" />
                    </div>
                    <p className="text-lg font-bold">{department.students}</p>
                    <p className="text-xs text-muted-foreground">Students</p>
                  </div>
                </div>

                <div className="pt-4 space-y-2">
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => console.log(`View department ${department.id}`)}
                  >
                    View Details
                  </Button>
                  <Button 
                    className="w-full bg-primary text-primary-foreground"
                    onClick={() => console.log(`Manage ${department.id}`)}
                  >
                    Manage Department
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Quick Stats */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>University Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-gradient-primary/10 rounded-lg">
                <Building className="h-8 w-8 text-primary mx-auto mb-2" />
                <p className="text-2xl font-bold">{mockDepartments.length}</p>
                <p className="text-sm text-muted-foreground">Total Departments</p>
              </div>
              
              <div className="text-center p-4 bg-gradient-secondary/10 rounded-lg">
                <BookOpen className="h-8 w-8 text-secondary mx-auto mb-2" />
                <p className="text-2xl font-bold">
                  {mockDepartments.reduce((sum, dept) => sum + dept.courses, 0)}
                </p>
                <p className="text-sm text-muted-foreground">Total Courses</p>
              </div>
              
              <div className="text-center p-4 bg-gradient-success/10 rounded-lg">
                <GraduationCap className="h-8 w-8 text-success mx-auto mb-2" />
                <p className="text-2xl font-bold">
                  {mockDepartments.reduce((sum, dept) => sum + dept.teachers, 0)}
                </p>
                <p className="text-sm text-muted-foreground">Total Teachers</p>
              </div>
              
              <div className="text-center p-4 bg-gradient-warning/10 rounded-lg">
                <Users className="h-8 w-8 text-warning mx-auto mb-2" />
                <p className="text-2xl font-bold">
                  {mockDepartments.reduce((sum, dept) => sum + dept.students, 0)}
                </p>
                <p className="text-sm text-muted-foreground">Total Students</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default Departments;