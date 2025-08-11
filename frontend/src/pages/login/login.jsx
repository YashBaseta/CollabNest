import { useState } from "react";
import { Input } from "../../components/ui/input";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import api from "../../api"; // adjust the path based on your folder structure

function LoginPage() {
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [password,setPassword] = useState('')
  const navigate= useNavigate()

  const login = async () => {
    const res = await api.post('/login', {name, email, password });
    const { token, user } = res.data;
    
    
    localStorage.setItem("token",res.data.token);
    localStorage.setItem("role",res.data.user.role);
    localStorage.setItem("userId", res.data.user.id); // Ensure user ID is saved

     if (user.role === "admin") {
      navigate("/admin/dashboard");
    } else if (user.role === "manager") {
      navigate("/manager/dashboard");
    } else {
      navigate("/user/dashboard");
    }
  }
  return (
    <>
        <div className=" min-h-screen bg-gradient-to-br from-amber-400 to-amber-800">
    <div>
     {/* CollabNest Logo Title */}
      <h1 className="text-3xl font-bold text-cyan-950  drop-shadow-md">
        CollabNest
      </h1>

    </div>
    <div className="flex flex-col items-center justify-center mt-20 px-4 py-12">
      
     

      {/* Login Card */}
      <div className="bg-white rounded-2xl shadow-2xl p-10 w-full max-w-md">
  <h2 className="text-4xl font-extrabold text-amber-700 mb-3 text-center">Login</h2>
  <p className="text-sm text-gray-600 mb-6 text-center">
    Don’t have an account?{" "}
    <a href="/register" className="text-amber-700 font-medium hover:underline">
      Sign up
    </a>
  </p>

  <div className="space-y-6">
    <Input
    onChange={e => setEmail(e.target.value)}
      type="email"
      placeholder="Email"
      className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500"
    />
    <div className="space-y-1">
      <Input
      onChange={e => setPassword(e.target.value)}
        type="password"
        placeholder="Password"
        className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500"
      />
      <div className="text-right">
        <a href="/forgot-password" className="text-sm text-amber-700 hover:underline">
          Forgot Password?
        </a>
      </div>
    </div>
  </div>

  <Button onClick={login} className="mt-6 w-full bg-amber-700 hover:bg-amber-800 text-white py-2.5 font-semibold rounded-lg transition duration-200 ease-in-out">
    Login
  </Button>
</div>

    </div>
    </div>
    </>
  );
}

export default LoginPage;
