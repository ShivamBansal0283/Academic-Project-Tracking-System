
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  BookOpen,
  Users,
  Trophy,
  Calendar,
  ArrowRight,
  GraduationCap,
  Target,
  Zap
} from "lucide-react";
import { Link } from "react-router-dom";

const Index = () => {
  const features = [
    {
      icon: Target,
      title: "Project Management",
      description: "Organize and track academic projects from inception to completion with intuitive tools."
    },
    {
      icon: Users,
      title: "Team Collaboration",
      description: "Form teams, invite members, and collaborate seamlessly on your academic projects."
    },
    {
      icon: BookOpen,
      title: "Course Integration",
      description: "Projects are automatically organized by courses and departments for easy management."
    },
    {
      icon: Trophy,
      title: "Progress Tracking",
      description: "Monitor task completion, submissions, and grades with detailed progress indicators."
    },
    {
      icon: Calendar,
      title: "Deadline Management",
      description: "Never miss a deadline with integrated calendar and notification system."
    },
    {
      icon: Zap,
      title: "Real-time Updates",
      description: "Get instant notifications about project updates, team invitations, and grades."
    }
  ];

  const stats = [
    { label: "Active Universities", value: "50+", icon: GraduationCap },
    { label: "Projects Completed", value: "10,000+", icon: Trophy },
    { label: "Students Engaged", value: "25,000+", icon: Users },
    { label: "Success Rate", value: "95%", icon: Target }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 gradient-hero rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">AP</span>
            </div>
            <h1 className="text-xl font-semibold">AcademiTrack</h1>
          </div>
          <div className="flex gap-4">
            <Link to="/login?role=student">
              <Button variant="outline">Student Login</Button>
            </Link>
            <Link to="/login?role=teacher">
              <Button className="bg-primary text-primary-foreground">Teacher Login</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-6">
        <div className="max-w-7xl mx-auto text-center space-y-8">
          <div className="space-y-4">
            <Badge className="bg-primary/10 text-primary border-primary/20">
              Academic Excellence Made Simple
            </Badge>
            <h1 className="text-5xl font-bold tracking-tight">
              Transform Your
              <span className="gradient-hero bg-clip-text text-transparent"> Academic Projects</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Streamline project management, enhance team collaboration, and achieve academic success
              with our comprehensive project tracking system designed for universities.
            </p>
          </div>

          <div className="flex items-center justify-center gap-4">
            <Link to="/login?role=student">
              <Button size="lg" className="bg-primary text-primary-foreground">
                Get Started as Student
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link to="/login?role=teacher">
              <Button size="lg" variant="outline">
                I'm a Teacher
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 px-6 bg-muted/30">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center space-y-2">
                <stat.icon className="h-8 w-8 mx-auto text-primary" />
                <div className="text-3xl font-bold">{stat.value}</div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-6">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="text-center space-y-4">
            <h2 className="text-3xl font-bold">Everything You Need for Academic Success</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Our platform provides all the tools necessary to manage academic projects effectively,
              from team formation to final submissions.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="hover:shadow-lg transition-all duration-300 animate-fade-in border-0 bg-gradient-to-b from-card to-muted/20">
                <CardHeader>
                  <div className="w-12 h-12 gradient-primary rounded-lg flex items-center justify-center mb-4">
                    <feature.icon className="h-6 w-6 text-white" />
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground leading-relaxed">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6 gradient-hero">
        <div className="max-w-4xl mx-auto text-center space-y-8 text-white">
          <h2 className="text-4xl font-bold">Ready to Transform Your Academic Experience?</h2>
          <p className="text-xl opacity-90 leading-relaxed">
            Join thousands of students and teachers who are already using AcademiTrack to
            streamline their academic projects and achieve better results.
          </p>
          <div className="flex items-center justify-center gap-4">
            <Link to="/login?role=student">
              <Button size="lg" className="bg-white text-primary hover:bg-gray-100">
                Start Your Journey
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
              Learn More
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 bg-card border-t border-border">
        <div className="max-w-7xl mx-auto text-center space-y-4">
          <div className="flex items-center justify-center gap-2">
            <div className="w-6 h-6 gradient-hero rounded flex items-center justify-center">
              <span className="text-white font-bold text-xs">AP</span>
            </div>
            <span className="font-semibold">AcademiTrack</span>
          </div>
          <p className="text-muted-foreground">
            Empowering academic excellence through innovative project management.
          </p>
          <p className="text-sm text-muted-foreground">
            © 2024 AcademiTrack. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
