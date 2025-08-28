import Image from "next/image";
import logoLinks from "@/data/logoLinks.json";  

export default function ProfileLogo() {
  return (
    <Image
      src={logoLinks.profileLogo}
      alt="Profile Logo"
      width={120}
      height={40}
      priority
      unoptimized
    />
  );
}
