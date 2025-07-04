# Network Equipment Integration Guide

## Overview

This guide walks you through connecting your WiFi voucher management system to actual network equipment. The system supports multiple router types and provides a complete integration framework.

## Supported Equipment

### 1. MikroTik Routers (RouterOS)
- **Models**: hAP, RouterBoard series, CCR series
- **Protocol**: RouterOS API (Port 8728)
- **Features**: Full hotspot management, bandwidth control, user authentication

### 2. pfSense Firewalls
- **Protocol**: HTTPS API (Port 443)
- **Features**: Captive portal, voucher management, bandwidth shaping

### 3. Generic RADIUS Equipment
- **Protocol**: RADIUS (Port 1812/1813)
- **Compatible with**: UniFi, OpenWRT, DD-WRT, any RADIUS-capable device

## Step-by-Step Integration Process

### Phase 1: System Preparation

1. **Access Admin Panel**
   - Login to your admin interface at `/admin/login`
   - Navigate to "Network Equipment" in the sidebar

2. **Choose Equipment Type**
   - Select your router type from the dropdown
   - System will auto-configure appropriate settings

### Phase 2: Network Equipment Configuration

#### For MikroTik RouterOS:

1. **Enable API Access**
   ```
   /ip service enable api
   /ip service set api port=8728
   ```

2. **Create Hotspot**
   ```
   /interface wireless security-profiles add name=hotspot authentication-types=wpa2-psk
   /ip hotspot add name=voucher-hotspot interface=wlan1
   ```

3. **Configure User Profiles**
   ```
   /ip hotspot user profile add name=voucher-basic rate-limit=10M/2M
   /ip hotspot user profile add name=voucher-premium rate-limit=50M/10M
   ```

#### For pfSense:

1. **Enable Captive Portal**
   - Navigate to Services → Captive Portal
   - Enable portal on LAN interface
   - Configure voucher authentication

2. **API Configuration**
   - System → User Manager → Settings
   - Enable API access
   - Generate API credentials

#### For Generic RADIUS:

1. **Configure RADIUS Server**
   - Install FreeRADIUS or similar
   - Configure clients (your access points)
   - Set shared secret

2. **Access Point Configuration**
   - Point AP to RADIUS server
   - Configure captive portal redirection

### Phase 3: System Configuration

1. **Update Network Settings**
   - Router IP: Your equipment's management IP
   - Port: API port (8728 for MikroTik, 443 for pfSense)
   - Credentials: Admin username and password
   - RADIUS Secret: Shared authentication secret

2. **Test Connection**
   - Use "Test Connection" button in admin panel
   - Verify successful communication

3. **Configure Network Parameters**
   - Client subnet (e.g., 192.168.100.0/24)
   - DNS servers
   - Captive portal URL

### Phase 4: Voucher Plan Mapping

The system automatically maps voucher plans to network policies:

- **Basic Plan**: 10 Mbps down, 2 Mbps up, 4-hour session
- **Premium Plan**: 50 Mbps down, 10 Mbps up, 24-hour session
- **Guest Plan**: 5 Mbps down, 1 Mbps up, 1-hour session
- **Business Plan**: 100 Mbps down, 20 Mbps up, unlimited session

## Environment Variables

Set these environment variables for production deployment:

```bash
# Router Configuration
ROUTER_HOST=192.168.1.1
ROUTER_PORT=8728
ROUTER_USERNAME=admin
ROUTER_PASSWORD=your_router_password

# RADIUS Configuration  
RADIUS_HOST=192.168.1.1
RADIUS_PORT=1812
RADIUS_SECRET=your_radius_secret

# Network Settings
EQUIPMENT_TYPE=mikrotik_hap
HOTSPOT_INTERFACE=wlan1
CLIENT_NETWORK=192.168.100.0/24
DNS_SERVERS=8.8.8.8,8.8.4.4

# Portal Settings
PORTAL_URL=http://192.168.1.1:3000
REDIRECT_URL=http://google.com
```

## Integration Flow

### 1. Customer Connection Process
```
Device connects → DHCP assigns IP → DNS redirects to portal → 
Customer enters voucher → System validates → Equipment authorizes → 
Internet access granted with limits
```

### 2. Backend Authorization Flow
```
Voucher validation → Database check → Network API call → 
Policy application → Session tracking → Real-time monitoring
```

## API Endpoints

The system provides these network management endpoints:

- `GET /api/network/config` - Get current configuration
- `POST /api/network/config` - Update network settings
- `POST /api/network/test-connection` - Test equipment connectivity
- `GET /api/network/active-devices` - List connected devices
- `POST /api/network/disconnect-device` - Force disconnect device

## Monitoring and Management

### Real-time Features
- Active device monitoring
- Bandwidth usage tracking
- Session time enforcement
- Data limit monitoring
- Automatic disconnection when limits exceeded

### Admin Dashboard
- Live connection status
- Equipment health monitoring
- Session statistics
- Error logging and alerts

## Troubleshooting

### Common Issues

1. **Connection Failed**
   - Verify IP address and port
   - Check firewall rules
   - Confirm API is enabled on equipment

2. **Authentication Failed**
   - Verify username/password
   - Check user permissions
   - Confirm API access rights

3. **Voucher Authorization Failed**
   - Check RADIUS configuration
   - Verify shared secret
   - Test captive portal redirection

### Debug Mode

Enable detailed logging by setting:
```bash
NODE_ENV=development
DEBUG_NETWORK=true
```

### Log Analysis

Monitor these log messages:
- `Network integration initialized` - System startup
- `Attempting to redeem voucher` - Customer requests
- `Network authorization result` - Equipment responses
- `Device authorized` - Successful connections

## Security Considerations

1. **API Security**
   - Use strong passwords
   - Limit API access by IP
   - Enable HTTPS where possible

2. **Network Isolation**
   - Separate guest and management networks
   - Use VLANs for traffic segregation
   - Implement proper firewall rules

3. **Monitoring**
   - Log all authentication attempts
   - Monitor for unusual usage patterns
   - Set up alerts for security events

## Production Deployment

### Recommended Architecture
```
Internet → Router/Firewall → Access Points → Voucher System
                         → Management Network → Admin Interface
```

### Scalability Options
- Multiple access points per voucher system
- Load balancing for high traffic
- Database clustering for reliability
- Redundant internet connections

## Support and Maintenance

### Regular Tasks
- Monitor equipment health
- Update firmware regularly
- Review security logs
- Backup configuration
- Test disaster recovery

### Performance Optimization
- Monitor bandwidth utilization
- Adjust user limits based on usage
- Optimize RADIUS response times
- Balance load across access points

## Next Steps

1. **Testing Phase**
   - Start with demo mode (no equipment required)
   - Test voucher validation and session tracking
   - Verify admin interface functionality

2. **Equipment Integration**
   - Connect to test equipment
   - Configure basic hotspot functionality
   - Test single device authorization

3. **Production Rollout**
   - Deploy to production network
   - Configure monitoring and alerts
   - Train staff on admin interface
   - Implement backup procedures

The system is designed to work in demo mode initially, allowing you to test all functionality before connecting real equipment. This ensures a smooth transition from development to production deployment.