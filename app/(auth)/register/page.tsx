import { RegisterForm } from "@/components/auth/RegisterForm"
import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Cadastro | VotaCâmara",
  description: "Crie uma nova conta para sua Câmara Municipal",
}

export default function RegisterPage() {
  return <RegisterForm />
}
