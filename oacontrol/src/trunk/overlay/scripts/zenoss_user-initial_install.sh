#!/bin/bash
#### FIRST ####
# User as ROOT must run root_user-initial_install.sh
# THEN run this script as zenoss
#    
####
CWD=`pwd`
echo ""
echo "Checking environment..."
# check to see if we are in /usr/local die if not
if [ $CWD != '/usr/local/zenoss/znyx/scripts' ] ; then
        echo " ERROR: You must run this from /usr/local/zenoss/znyx/scripts"
        exit 0
fi

# check to see if we are zenoss, die if not
if [ `whoami` != "zenoss" ]; then
        echo "ERROR:  zenoss user is required for this script"
        exit
fi

echo ""
echo "Stopping Zenoss Python elements..."
# stop zenoss
zenoss stop

# copy the images into the zenoss file system

# force image replacement:
# check to see image exists, if not, fail and error
cd ../images

echo ""
echo "Installing Znyx graphics..."
rm -f /usr/local/zenoss/zenoss/Products/ZenModel/skins/zenmodel/zenoss-login.png
cp  znyxzenoss-login.png /usr/local/zenoss/zenoss/Products/ZenModel/skins/zenmodel/zenoss-login.png

rm -f /usr/local/zenoss/zenoss/Products/ZenWidgets/skins/zenui/img/zenoss_logo_white.png
cp  znyxzenoss_logo_white.png  /usr/local/zenoss/zenoss/Products/ZenWidgets/skins/zenui/img/zenoss_logo_white.png

rm -f /usr/local/zenoss/zenoss/Products/ZenWidgets/skins/zenui/img/zenoss_black_logo.png
cp  znyxzenoss_black_logo.png  /usr/local/zenoss/zenoss/Products/ZenWidgets/skins/zenui/img/zenoss_black_logo.png

rm -f /usr/local/zenoss/zenoss/Products/ZenWidgets/skins/zenui/img/onwhitelogo.png
cp  znyxonwhitelogo.png  /usr/local/zenoss/zenoss/Products/ZenWidgets/skins/zenui/img/onwhitelogo.png

rm -f /usr/local/zenoss/zenoss/Products/ZenWidgets/skins/zenui/logo.png
cp   znyxlogo.png /usr/local/zenoss/zenoss/Products/ZenWidgets/skins/zenui/logo.png

rm -f /usr/local/zenoss/zenoss/Products/ZenModel/skins/zenmodel/favicon.ico
cp favicon.ico  /usr/local/zenoss/zenoss/Products/ZenModel/skins/zenmodel/

echo ""
echo "Starting Zenoss Python elements..."
# restart zenoss
zenoss restart

echo ""
echo "Installing Zenpacks..."
# install zenpacks
zenpack --install=../ZenPacks.znyx.OAControl-1.0-py2.6.egg  
zenpack --install=../ZenPacks.znyx.OAControlPortlet-1.0-py2.6.egg

echo ""
echo "Re-starting Zenoss Python elements again..."
# restart zenoss
zenoss restart


echo ""
echo "  Completed initial installation of OAControl"
echo "  aim your Firefox browser at http://<this system>/oac"
echo "  other browsers, particularly IE, are not supported."
echo ""

