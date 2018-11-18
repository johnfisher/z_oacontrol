#########################################################################
#
#       High level makefile for OAControl
#       oacontrol/src/trunk
#
#########################################################################


VERSION:=`cat ./version`
VERHEADER= For Use with OAControl Version -   

usage:
	@echo "make daemon    - makes an Egg of ZenPacks.znyx.OAControl"
	@echo "make webapp    - makes an Egg of ZenPacks.znyx.OAControlPortlet"
	@echo "make overlay   - makes the overlay"
	@echo "make release   - makes both eggs, and packages everything"
	@echo "make clean     - cleans up build products"
	@echo "make usage     - usage"
	@echo "make           - usage"



all:    usage

daemon: cleanprep daemon_build

webapp: cleanprep webapp_build

overlay: cleanprep overlay_build


daemon_build:    
	@echo "make the daemon egg"
	@echo ""
	cd ./zenpacks/ZenPacks.znyx.OAControl && rm -rf build dist && python setup.py bdist_egg
	cp zenpacks/ZenPacks.znyx.OAControl/dist/ZenPacks.znyx.OAControl-1.0-py2.7.egg release
	mv release/ZenPacks.znyx.OAControl-1.0-py2.7.egg  release/ZenPacks.znyx.OAControl-1.0-py2.6.egg

webapp_build: 
	@echo "make the webapp egg"
	@echo ""
	cd ./zenpacks/ZenPacks.znyx.OAControlPortlet && rm -rf build dist && python setup.py bdist_egg
	cp ./zenpacks/ZenPacks.znyx.OAControlPortlet/dist/ZenPacks.znyx.OAControlPortlet-1.0-py2.7.egg release
	mv release/ZenPacks.znyx.OAControlPortlet-1.0-py2.7.egg release/ZenPacks.znyx.OAControlPortlet-1.0-py2.6.egg

overlay_build: daemon_build webapp_build
	@echo "make the overlay"
	@echo "making the znyx dir tarball..."
	rm -rf release/znyx release/znyxdir.tgz
	mkdir release/znyx ; mkdir release/znyx/apache
	cp ./apache_etc/* release/znyx/apache
	cp ./apache_docroot/*.xml release/znyx/apache
	cp -r ./overlay/* release/znyx
	cp version release/znyx
	@echo "Getting the eggs..."
	@echo ""
	cp ./zenpacks/ZenPacks.znyx.OAControlPortlet/dist/ZenPacks.znyx.OAControlPortlet*.egg release/znyx
	mv release/znyx/ZenPacks.znyx.OAControlPortlet-1.0-py2.7.egg release/znyx/ZenPacks.znyx.OAControlPortlet-1.0-py2.6.egg
	cp ./zenpacks/ZenPacks.znyx.OAControl/dist/ZenPacks.znyx.OAControl*.egg release/znyx
	mv release/znyx/ZenPacks.znyx.OAControl-1.0-py2.7.egg release/znyx/ZenPacks.znyx.OAControl-1.0-py2.6.egg
	cp ./zenoss/zenoss*.deb release
	cd release && tar czf znyxdir.tgz znyx && rm -rf znyx

release: cleanprep  overlay_build
	@echo "make  the whole package"
	@echo ""
	cp -r overlay/scripts release/
	cp overlay/README_initial_install.txt release/
	cd release && md5sum znyxdir.tgz > znyxdir.tgz.md5
	@echo "Making tarball..."
	@echo ""
	@echo "............. ALL DONE ................"
	@echo "   See release directory for output"
	@echo ""
	
cleanprep: 
	rm -rf release; 
	rm -rf znyx znyxdir.tgz
	rm -f znyx-oacontrol.tgz znyx-oacontrol.tgz.md5
	mkdir release

clean:
	rm -rf release 

