import { LoginComponent } from "./components/LoginComponent";
import Image from "next/image";
const SignInPage = async () => {
  return (
    <div className="h-full">
      {/* Logo */}
      <div className="flex items-center justify-center">
        <Image
          src="/images/yuyanalogo.png"
          alt={`Yuyana Crm Logo`}
          width={180}
          height={50}
          priority
        />
      </div>
      <div className="">
        <h1 className="scroll-m-15 text-4xl font-extrabold tracking-tight lg:text-5xl">
          Welcome to {process.env.NEXT_PUBLIC_APP_NAME}
        </h1>
      </div>
      <div>
        <LoginComponent />
      </div>
    </div>
  );
};

export default SignInPage;
