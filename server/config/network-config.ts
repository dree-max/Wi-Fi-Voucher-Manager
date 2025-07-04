import type { NetworkConfig } from '../network-integration';

/**
 * Network Configuration Management
 * Handles different network equipment configurations
 */

export const DEFAULT_NETWORK_CONFIG: NetworkConfig = {
  // Router/Gateway Configuration
  routerType: 'mikrotik',
  routerHost: process.env.ROUTER_HOST || '192.168.1.1',
  routerPort: parseInt(process.env.ROUTER_PORT || '8728'),
  routerUsername: process.env.ROUTER_USERNAME || 'admin',
  routerPassword: process.env.ROUTER_PASSWORD || '',
  
  // RADIUS Server Configuration
  radiusHost: process.env.RADIUS_HOST || '127.0.0.1',
  radiusPort: parseInt(process.env.RADIUS_PORT || '1812'),
  radiusSecret: process.env.RADIUS_SECRET || 'testing123',
  
  // Network Settings
  hotspotInterface: process.env.HOTSPOT_INTERFACE || 'wlan1',
  clientNetwork: process.env.CLIENT_NETWORK || '192.168.100.0/24',
  dnsServers: process.env.DNS_SERVERS?.split(',') || ['8.8.8.8', '8.8.4.4'],
  
  // Captive Portal Settings
  portalUrl: process.env.PORTAL_URL || 'http://192.168.1.1:3000',
  redirectUrl: process.env.REDIRECT_URL || 'http://google.com',
};

/**
 * Equipment-specific configurations
 */
export const EQUIPMENT_PROFILES = {
  mikrotik_hap: {
    routerType: 'mikrotik' as const,
    routerPort: 8728,
    hotspotInterface: 'wlan1',
    clientNetwork: '192.168.100.0/24',
  },
  mikrotik_routerboard: {
    routerType: 'mikrotik' as const,
    routerPort: 8728,
    hotspotInterface: 'bridge-hotspot',
    clientNetwork: '192.168.100.0/24',
  },
  pfsense_standard: {
    routerType: 'pfsense' as const,
    routerPort: 443,
    hotspotInterface: 'em1',
    clientNetwork: '192.168.200.0/24',
  },
  unifi_controller: {
    routerType: 'generic' as const,
    routerPort: 8443,
    hotspotInterface: 'eth0',
    clientNetwork: '192.168.10.0/24',
  },
};

export function getNetworkConfig(equipmentType?: string): NetworkConfig {
  const baseConfig = { ...DEFAULT_NETWORK_CONFIG };
  
  if (equipmentType && equipmentType in EQUIPMENT_PROFILES) {
    const profile = EQUIPMENT_PROFILES[equipmentType as keyof typeof EQUIPMENT_PROFILES];
    return { ...baseConfig, ...profile };
  }
  
  return baseConfig;
}