sudo iptables -I INPUT -p tcp --dport 3300 -j ACCEPT
sudo firewall-cmd --zone=public --add-port=3300/tcp --permanent 2>/dev/null || true
sudo firewall-cmd --reload 2>/dev/null || true
curl -I http://127.0.0.1:3300/index.html
