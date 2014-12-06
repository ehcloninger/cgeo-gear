##cgeo-gear
=========

c:geo-gear is an Android app that is a companion to the popular 
(c:geo Geocaching)[https://play.google.com/store/apps/details?id=cgeo.geocaching] app.

Data from c:geo is transmitted to c:geo-gear and on to a Tizen-based Samsung Gear S 
watch, allowing the user to locate geocaches with a Gear watch, leaving their phone
in their pocket.

The behavior of the app is simple. If the user launches it, there is only a description
of the app and a button to launch c:geo.  If c:geo doesn't exist, the button is not 
enabled.  

The user makes use of c:geo-gear by launching c:geo and opening a geocache from it's list.  
Inside the list is a button for launching external map and navigation apps.  One of these 
items is named "Android Wear". When the user chooses this item, an intent is launched and
c:geo-gear will respond to it by filling out it's UI with a few data points about the 
geocache. The button then allows the user to send a Rich Notification to the watch that
contains the cache name, cache code, and coordinates.  Once the notification is sent
c:geo-gear quits and control returns to c:geo.

###Building c:geo-gear
=======================

Build the project with Eclipse and the Android ADT plugins.  There is not a gradle project
for c:geo-gear.  Import into Eclipse as any Android project and build.  The dependent libraries
are from the Samsung developer site.

###TODO
======

* Finish the Tizen widget

* Separate the main Activity into two. One for user launch and one responding to the intent.
The current behavior is modal and requires some switching back and forth.

* Create an about box with credits.

* Work to get a separate intent for Gear with the c:geo team.  Allow the addition of hint 
to the message.

* Work on the callback so the user can press "Found it" on the Tizen app and be returned to
c:geo for the log.

* Clean up the notification content.

###Credits
=========

* The (c:geo team)[https://github.com/cgeo] for fixing a bug that caused their app to crash when this app was loaded.

* Cullin Moran (@culmor30)[https://github.com/culmor30] for the c:geo-wear project, where I got a few pointers on making a 
plugin for c:geo. In particular, GearService is based on a similar class in his project.

* The icons on the Gear notification come from the Google (Material Design icon pack)[https://github.com/google/material-design-icons]/
