"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpAlert = exports.DownAlert = void 0;
const DownAlert = (LastCheckedTime, siteName) => `
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Site Down Alert</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            margin: 0;
            padding: 0;
            background-color: #f4f4f4;
        }
        .email-container {
            max-width: 600px;
            margin: 40px auto;
            background: white;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
            overflow: hidden;
        }
        .header {
            background: #ff4444;
            color: white;
            padding: 20px;
            text-align: center;
        }
        .content {
            padding: 30px;
            background: white;
        }
        .status-badge {
            background: #ff4444;
            color: white;
            padding: 8px 16px;
            border-radius: 20px;
            display: inline-block;
            margin-bottom: 20px;
        }
        .details {
            background: #f8f9fa;
            padding: 20px;
            border-radius: 6px;
            margin: 20px 0;
        }
        .action-button {
            display: inline-block;
            background: #007bff;
            color: white;
            padding: 12px 24px;
            text-decoration: none;
            border-radius: 4px;
            margin-top: 20px;
        }
        .footer {
            text-align: center;
            padding: 20px;
            color: #666;
            font-size: 0.9em;
            border-top: 1px solid #eee;
        }
    </style>
</head>
<body>
    <div class="email-container">
        <div class="header">
            <h1>⚠️ Site Down Alert</h1>
        </div>
        <div class="content">
            <div class="status-badge">Site Offline</div>
            <h2>Your website ${siteName} is currently experiencing issues</h2>
            <p>We detected that your website became Unavailable at <strong id="timestamp"></strong></p>
            
            <div class="details">
                <h3>Incident Details:</h3>
                <ul>
                    <li>Status: Not responding</li>
                    <li>HTTP Status: 503</li>
                    <li>Last checked: <span id="currentTime">${LastCheckedTime}</span></li>
                </ul>
            </div>

            <p>Our monitoring system will continue to check your site's status every 3 minutes and will notify you once it's back online.</p>

            <a href="https://monitor-app-nine.vercel.app" class="action-button">View Dashboard</a>
        </div>
        <div class="footer">
            <p>This is an automated message from your website monitoring service</p>
            <p>© 2024 Site Monitor. All rights reserved.</p>
        </div>
    </div>
</body>
</html>`;
exports.DownAlert = DownAlert;
const UpAlert = (siteName, lastChecked) => `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Site Restored Alert</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            margin: 0;
            padding: 0;
            background-color: #f4f4f4;
        }
        .email-container {
            max-width: 600px;
            margin: 40px auto;
            background: white;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
            overflow: hidden;
        }
        .header {
            background: #28a745;
            color: white;
            padding: 20px;
            text-align: center;
        }
        .content {
            padding: 30px;
            background: white;
        }
        .status-badge {
            background: #28a745;
            color: white;
            padding: 8px 16px;
            border-radius: 20px;
            display: inline-block;
            margin-bottom: 20px;
        }
        .details {
            background: #f8f9fa;
            padding: 20px;
            border-radius: 6px;
            margin: 20px 0;
        }
        .metrics {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 20px;
            margin: 20px 0;
        }
        .metric-card {
            background: #f8f9fa;
            padding: 15px;
            border-radius: 6px;
            text-align: center;
        }
        .metric-value {
            font-size: 1.5em;
            font-weight: bold;
            color: #28a745;
        }
        .action-button {
            display: inline-block;
            background: #007bff;
            color: white;
            padding: 12px 24px;
            text-decoration: none;
            border-radius: 4px;
            margin-top: 20px;
        }
        .footer {
            text-align: center;
            padding: 20px;
            color: #666;
            font-size: 0.9em;
            border-top: 1px solid #eee;
        }
    </style>
</head>
<body>
    <div class="email-container">
        <div class="header">
            <h1>✅ Site Restored</h1>
        </div>
        <div class="content">
            <div class="status-badge">Site Online</div>
            <h2>Your website ${siteName} is back online!</h2>
            <p>We're pleased to inform you that your website has been restored and is now fully operational as of <strong >${lastChecked}</strong></p>
            
            <div class="metrics">
                <div class="metric-card">
                    <div class="metric-value">100%</div>
                    <div>Current Uptime</div>
                </div>
                <div class="metric-card">
                    <div class="metric-value">200ms</div>
                    <div>Response Time</div>
                </div>
            </div>

            <div class="details">
                <h3>Recovery Details:</h3>
                <ul>
                    <li>Status: Fully Operational</li>
                    <li>HTTP Status: 200 OK</li>
                    <li>Last checked: <span>${lastChecked}</span></li>
                </ul>
            </div>

            <p>Our monitoring system will continue to track your site's performance to ensure stable operation.</p>

            <a href="#" class="action-button">View Detailed Report</a>
        </div>
        <div class="footer">
            <p>This is an automated message from your website monitoring service</p>
            <p>© 2024 Site Monitor. All rights reserved.</p>
        </div>
    </div>

    <script>
        // Set current timestamp
        const now = new Date();
        document.getElementById('timestamp').textContent = now.toLocaleString();
        document.getElementById('currentTime').textContent = now.toLocaleString();
    </script>
</body>
</html>`;
exports.UpAlert = UpAlert;
