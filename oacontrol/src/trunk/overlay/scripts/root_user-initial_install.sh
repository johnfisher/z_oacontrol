#!/bin/bash
#### RUN THIS FIRST ####
# User as ROOT must run this before zenoss_user-initial_install.sh
# 
####
echo ""
echo " Checking for environment..."
echo ""


# check to see if we are root, die if not
if [ `whoami` != "root" ]; then
        echo "ERROR:  root is required for this script"
        exit
fi



######################################################################################
### checks for demo, maybe someday we can do this all through zenpacks?
CWD=`pwd`
# check for apache, if not die
if [ ! -d /etc/apache2 ]; then
        echo "ERROR:  Apache2 is not installed at /etc/apache2...."
        exit
fi

# check for zenoss, if not die
if [ ! -d /usr/local/zenoss ]; then
        echo "ERROR:  Zenoss is not installed at /usr/local/zenoss...."
        exit
fi

# set the webapp link
mkdir /usr/local/zenoss/oac
chown zenoss /usr/local/zenoss/oac
chgrp zenoss /usr/local/zenoss/oac
chmod 755 /usr/local/zenoss/oac
ln -s /usr/local/zenoss/oac  /var/www/oac

# set the RRD links
ln -s /usr/local/zenoss/common/libexec   /usr/local/zenoss/zenoss/libexec
ln -s /usr/local/zenoss/common/share     /usr/local/zenoss/zenoss/share

echo ""
echo "Stopping Zenoss..."
# stop whole stack
/etc/init.d/zenoss-stack  stop

echo ""

# setup znyx directory for zenoss install script
cd /usr/local/zenoss/znyx
if [ ! -d apache ]; then
        echo "ERROR:  Script cant find the apache dir at $CWD"
		echo " cleaning up...."
		rm -rf /usr/local/zenoss/oac /var/www/oac /usr/local/zenoss/zenoss/libexec /usr/local/zenoss/zenoss/share
        exit
fi


# setup apache
echo ""
echo " Setting up Apache for Zenoss"
cp apache/httpd.conf /etc/apache2

# patch bug in proxy_html for 64 bit
cp apache/proxy_html.load /etc/apache2/mods-available

# install mods into apache
a2enmod proxy_html
a2enmod proxy_connect                                                                                                                                                                                                                                                                                                                                               
a2enmod proxy_http  

echo ""
echo "Restarting Apache..."
# restart apache
service apache2 restart

# fix permissions in zenoss tree
echo ""
echo " Fixing permissions..."
chown -R zenoss /usr/local/zenoss/znyx
chgrp -R zenoss /usr/local/zenoss/znyx

#
# restart whole stack
echo ""
echo " Restarting Zenoss...."
/etc/init.d/zenoss-stack  start


echo ""
echo " Now su - zenoss  ( change to zenoss user )"
echo " run:  cd /usr/local/zenoss/znyx/scripts"
echo " run: zenoss_user-initial_install.sh ...."
echo ""

exit
