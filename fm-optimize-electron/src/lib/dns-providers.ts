import { Baby, Cloud, Globe, Settings, Shield, ShieldAlert, ShieldCheck } from 'lucide-react';

export interface DnsProvider {
  name: string;
  primary: string;
  secondary: string;
  description: string;
  icon: typeof Cloud;
  features: string[];
  isDhcp?: boolean;
}

export const DNS_PROVIDERS: DnsProvider[] = [
  {
    name: 'Cloudflare',
    primary: '1.1.1.1',
    secondary: '1.0.0.1',
    description: 'Privacidade extrema. Sem logs de consulta.',
    icon: Cloud,
    features: ['Privacidade', 'Sem logs'],
  },
  {
    name: 'Google',
    primary: '8.8.8.8',
    secondary: '8.8.4.4',
    description: 'Rápido e confiável. Mantido pelo Google.',
    icon: Globe,
    features: ['Velocidade', 'Confiável'],
  },
  {
    name: 'Quad9',
    primary: '9.9.9.9',
    secondary: '149.112.112.112',
    description: 'Bloqueia malware e phishing automaticamente.',
    icon: ShieldCheck,
    features: ['Segurança', 'Anti-malware'],
  },
  {
    name: 'OpenDNS',
    primary: '208.67.222.222',
    secondary: '208.67.220.220',
    description: 'Filtragem de conteúdo e proteção familiar.',
    icon: Shield,
    features: ['Filtragem', 'Família'],
  },
  {
    name: 'AdGuard',
    primary: '94.140.14.14',
    secondary: '94.140.15.15',
    description: 'Bloqueia anúncios e rastreadores.',
    icon: ShieldAlert,
    features: ['Anúncios', 'Rastreadores'],
  },
  {
    name: 'CleanBrowsing',
    primary: '185.228.168.168',
    secondary: '185.228.169.168',
    description: 'Segurança familiar. Bloqueia conteúdo adulto.',
    icon: Baby,
    features: ['Família', 'Segurança'],
  },
  {
    name: 'DHCP (Padrão)',
    primary: '',
    secondary: '',
    description: 'Restaura configuração de rede do provedor.',
    icon: Settings,
    features: ['Padrão'],
    isDhcp: true,
  },
];
