# z_oacontrol
This was a project based in Zenoss to automate/monitor ATCA telephony network and compute equipment.

The company, Znyx Networks, made the equipment and I made this front end for it. The project was never finished, due to lack of interest from customers, who used SNMP tools to monitor mostly. Reviving the project would require a refactoring of the Javascript, but the use of SVGs for animation still makes sense. The SVG animation would need a new library, as time has passed by the old one.

There is an interesting SVG file that was coupled  with  AJAX ( too early for React or Angular) to get real time connection to the many LEDs on the equipment face.

The equipment was a six slot chassis with two switches, fully HA.

![znyx switches](https://github.com/johnfisher/z_oacontrol/ZX2000_master_exploded.png)
