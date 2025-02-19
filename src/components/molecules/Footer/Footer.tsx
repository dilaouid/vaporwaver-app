import { GitHubIcon } from "@/components/atoms/GithubIcon";

export const Footer: React.FC = () => {
  return (
    <footer className="text-center mt-8">
      <a
        href="https://github.com/dilaouid/vaporwaver"
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-2 text-gray-400 hover:text-purple-400 transition-colors"
      >
        <GitHubIcon  />
        Source Code
      </a>
      <p className="text-gray-400 text-sm mt-2">
        Created by dilaouid • Powered by vaporwaver-ts
      </p>
    </footer>
  );
};