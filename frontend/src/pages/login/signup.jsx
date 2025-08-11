import { useState } from "react";
import { Input } from "../../components/ui/input";
import api from "../../api"; // adjust the path based on your folder structure
function SignupPage() {

  const [form ,setForm] = useState({name:"",email:"",password:"", role:"user"})
const register = async() =>{
   await api
.post('/register', form);
    alert("Registered! Now login.");
    setForm({
      name: "",
      email: "",
      password: "",
      
    });
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
      <div className="bg-white rounded-2xl shadow-2xl h-100 p-10 w-full max-w-md">
        <h2 className="text-4xl font-extrabold text-amber-700 mb-3 text-center">SignUp</h2>
        <p className="text-sm text-gray-600 mb-6 text-center">
          Already have an account{" "}
          <a href="/" className="text-amber-700 font-medium hover:underline">
            Login
          </a>
        </p>

        <div className="space-y-7">
    
          <Input
          onChange={e => setForm({ ...form, name: e.target.value })} 
            type="name"
            placeholder="Name"
            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
          <Input
          onChange={e => setForm({ ...form, email: e.target.value })} 
            type="email"
            placeholder="Email"
            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
          <Input
          onChange={e => setForm({ ...form, password: e.target.value })} 
            type="password"
            placeholder="Password"
            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
        </div>

        <button onClick={register} className="mt-6 w-full bg-amber-700 hover:bg-amber-800 text-white py-2.5 font-semibold rounded-lg transition duration-200 ease-in-out">
          Sign Up
        </button>
      </div>
    </div>
    </div>
    </>
  );
}

export default SignupPage;
