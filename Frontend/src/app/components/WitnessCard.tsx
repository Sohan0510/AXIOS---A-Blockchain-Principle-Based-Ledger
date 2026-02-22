import { motion } from 'motion/react';
import { KeyRound, Server } from 'lucide-react';

interface WitnessCardProps {
  signature: string;
  publicKey: string;
  url: string;
  index: number;
}

export function WitnessCard({ signature, publicKey, url, index }: WitnessCardProps) {
  const truncate = (str: string, len: number) =>
    str.length > len ? str.slice(0, len) + '...' : str;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.1, ease: [0.2, 0.9, 0.25, 1] }}
      className="rounded-lg border border-[#7c3aed]/20 bg-[#7c3aed]/5 p-4"
    >
      <div className="flex items-center gap-2 mb-3">
        <div className="w-8 h-8 rounded-full bg-[#7c3aed]/20 flex items-center justify-center">
          <KeyRound size={14} className="text-[#7c3aed]" />
        </div>
        <div>
          <p className="text-[13px] text-[#f9fafb]">Witness #{index + 1}</p>
          <div className="flex items-center gap-1 text-[11px] text-[#9ca3af]">
            <Server size={10} />
            {url}
          </div>
        </div>
      </div>
      <div className="space-y-2">
        <div className="rounded bg-[#0b1220] p-2">
          <span className="text-[10px] text-[#9ca3af] uppercase tracking-wider">Signature</span>
          <p className="text-[11px] text-[#7c3aed] font-mono mt-0.5 break-all">{truncate(signature, 80)}</p>
        </div>
        <div className="rounded bg-[#0b1220] p-2">
          <span className="text-[10px] text-[#9ca3af] uppercase tracking-wider">Public Key</span>
          <p className="text-[11px] text-[#06b6d4] font-mono mt-0.5 break-all">{truncate(publicKey, 60)}</p>
        </div>
      </div>
    </motion.div>
  );
}
