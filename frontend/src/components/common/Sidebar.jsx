import { SidebarGroupAction, SidebarHeader, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { Calendar , ChevronDown, Home, Inbox, Plus, Search, Settings,LogOut, ChartBar } from "lucide-react"
 import { Folder, Hospital, User } from "lucide-react";
import {Sidebar,SidebarContent,SidebarGroup,SidebarGroupContent,SidebarGroupLabel,SidebarMenu,SidebarMenuButton,SidebarMenuItem,} from "@/components/ui/sidebar"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../ui/dropdown-menu"
import { useState, useRef, useEffect, useContext } from "react";
import api from "../../api"; // adjust the path based on your folder structure
import ProjectFormDialog from "./forms";
import { Link } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";




const iconMap = {
  ecommerce: Folder,
  hospital: Hospital,
  portfolio: User,
};

function Side({children}) {

   const [projects, setProjects] = useState([]);
   const { user, setUser } = useContext(AuthContext);
   

  useEffect(() => {
    fetchProjects();
    fetchUser();
  }, []);


const fetchUser = async () => {
    try {
      const userId = localStorage.getItem("userId");
      if (!userId) return;
      const res = await api.get(`/users/${userId}`);
      setUser(res.data);  // Store user globally
    //  console.log(res.data.role);
    } catch (error) {
      console.error("Failed to fetch user:", error);
    }
  };
  
  
  const fetchProjects = async () => {
    try {
    
    const userId = localStorage.getItem("userId");
    const res = await api.get("/projects");

    // Filter projects where the user is either creator or a team member
    const filteredProjects = res.data.filter(
      (project) =>
        project.userId?._id === userId || // Created by user
        (project.members || []).some((member) => member._id === userId) // Member
    );

    const role =user?.role || "user"; 
    const projectsWithExtras = filteredProjects.map((project) => ({
      ...project,
      url:
    role === "admin"
      ? `/admin/projects/${project._id}`
      : `/user/projects/${project._id}`,
      icon: iconMap[project.key] || Folder,
    }));

    setProjects(projectsWithExtras);
  } catch (error) {
    console.error("Error fetching projects:", error);
  }
};

const userRole = user?.role;




// Menu items.
const items = [
    {
    title: "Home",
    url: userRole === "admin" ? "/admin/dashboard" : "/user/dashboard",
    icon: Home,
   
  },
  {
    title: "Inbox",
    url: "#",
    icon: Inbox,
  },
  {
    title: "Calendar",
    url: "#",
    icon: Calendar,
  },
  {
    title: "Chat",
    url: userRole === "admin" ? "/admin/chat" : "/user/chat",
    icon: ChartBar,
  },
  {
    title: "Settings",
    url: "#",
    icon: Settings,
  },
]

const [open, setOpen] = useState(false);

const handleClick = () => {
    setOpen(true); // show the component when clicked
  };

  return (
    <>
    
    <SidebarProvider >
      
      
        
            <Sidebar>
        <SidebarHeader>
    <h1 className="text-xl text-blue-700 font-bold">CollabNest</h1>
    
  </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
           
          <SidebarGroupLabel className="text-pink-800 " >Application</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <a href={item.url} >
                      <item.icon />
                      <span>{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton>
              Select Workspace
              <ChevronDown className="ml-auto" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-60">
            <DropdownMenuItem>
              <span>Workspace 1</span>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <span>Workspace 2</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
    <SidebarGroup>
      <SidebarGroupLabel className="text-">Projects <Plus onClick={handleClick} style={{marginLeft:"170px"}}/><ProjectFormDialog open={open} setOpen={setOpen} onProjectCreated={fetchProjects}  /></SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu>
          {projects.map((project) => (
            <SidebarMenuItem key={project.name}>
              <SidebarMenuButton asChild>
                <Link to={project.url}>
                <project.icon className="w-4 h-4 mr-2" />
                  <span>{project.name}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  
      </SidebarContent>
    </Sidebar>
      
    </SidebarProvider>
   
    </>
  )
}


export default Side;











