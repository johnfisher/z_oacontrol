#!/bin/bash
#### FIRST ####
# User as ROOT must download zenoss and install appropriate type
# http://community.zenoss.org/docs/DOC-3240?noregister
# 
####
#### SECOND ####
# User as ZENOSS must download tarball and unpack in /usr/local/zenoss
# this script is in znyx/scripts
####

# check to see if we are in /usr/local die if not

# check to see if we are zenoss, die if not

# check to see if mysql running, die if not

# check for default env vars

# add /usr/local/zenoss/zenoss/bin to path if not there

# figure out where we are
SCRIPTHOME=`pwd` # or SCRIPTHOME='/usr/local/zenoss/oac/zcripts'

######################################################################################
### checks for demo, maybe someday we can do this all through zenpacks?

# check for apache, if not die

# find docroot
APACHEDOCROOT='/var/www'

# AS ROOT make link in docroot for webapp
#cd $APACHEDOCROOT
#ln -s $ZENOSSZNYX/webapp ./oac
echo ""
echo" You must su to root and add a link in Apache's DOCROOT:"
echo" cd DOCROOT and softlink to /usr/local/zenoss/znyx/webapp to oac"
echo "return to user zenoss"
echo ""



###
######################################################################################

# print some sort of banner

# stop zenoss
zenoss stop

# copy the images into the zenoss file system
# do a check to see if the user has already replaced any
# maybe ask if user wants images replaced?

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

# put webapps into zenoss 

# restart zenoss
zenoss restart


# install zenpacks
cd ../zenpacks
zenpack --install=ZenPacks.znyx.oac-1.0-py2.6.egg
zenpack --install=ZenPacks.Znyx.OACJF-1.0-py2.6.egg


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









