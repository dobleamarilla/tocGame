Configuracion para UBUNTU
systemctl => tocGamePermisos.service
 [Unit]
 Description=Permisos impresora
 [Service]
 Type=simple
 ExecStart=/bin/bash /home/hit/tpcGame/scritps/permisos.sh
 Restart=always
 RestartSec=60
 StandardOutput=syslog
 StandardError=syslog
 SyslogIdentifier=tocGamePermisos
 [Install]
 WantedBy=multi-user.target


 Inicio de tocGame => /home/hit/inicio.sh =>  /home/hit/tocGame/./tocGame