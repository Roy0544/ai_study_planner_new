import SignUpClient from "./signup-client";

export const metadata = {
  title: "Create an Account",
  description: "Join GKVK AI and start generating revision sets, quizzes, mindmaps, and crowdsourced lecture notes.",
};

export default function SignUpPage() {
  return <SignUpClient />;
}
