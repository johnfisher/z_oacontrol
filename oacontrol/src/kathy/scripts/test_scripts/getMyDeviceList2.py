devices = context.getDevices()
return [ d.id for d in devices.getSubDevices() ]
