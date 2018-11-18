#!/bin/bash
# truncated install script for demo6 of OAControl
#
echo ""
echo "DEMO6: Installing Znyx changes to Zenoss....."
echo " You must run this in /usr/local as the zenoss user!"

echo ""
echo ""

# check pwd
WHERE=`pwd`
if  $WHERE != "/usr/local" ; then
echo " Bad location: $WHERE ... must be /usr/local"
exit
fi

# check user
USER=`whoami`
if $USER != "zenoss" ; then
echo "Bad user: $USER ... must be zenoss."
exit
fi

# stop zenoss
zenoss stop



# force image replacement:
# check to see image exists, if not, fail and error

cd ../images


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


# restart zenoss
zenoss restart




# do something to change the dashboard
#
#
#
#
#

# do something to add manager and engineer users
#
#
#
#
#









