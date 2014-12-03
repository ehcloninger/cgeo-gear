/*
	Copyright 2014 Purplefoto
 */

// Credit to Cullin Moran (github:culmor30) for Service outline

package com.purplefoto.cgeogear;

import android.app.Service;
import android.content.Context;
import android.content.Intent;
import android.location.Location;
import android.os.IBinder;

public class GearService extends Service {
	public static final String DEBUG_TAG = "com.purplefoto.cgearo";

	private static final String INTENT_GEAR = "cgeo.geocaching.gear.NAVIGATE_TO";
	private static final String INTENT_WEAR = "cgeo.geocaching.wear.NAVIGATE_TO";

    private static final String PREFIX = "cgeo.geocaching.intent.extra.";

    public static final String EXTRA_LATITUDE = PREFIX + "latitude";
    public static final String EXTRA_LONGITUDE = PREFIX + "longitude";
    public static final String EXTRA_GEOCODE = PREFIX + "geocode";
    public static final String EXTRA_HINT = PREFIX + "hint";
    public static final String EXTRA_NAME = PREFIX + "name";

	private String cacheName;
	private String geocode;
	private Location geocacheLocation;
	private String hint;

	@Override
	public int onStartCommand(Intent intent, int flags, int startId) {
		if(intent != null) {
			final String action = intent.getAction();
			if(INTENT_WEAR.equals(action) || INTENT_GEAR.equals(action) ) {
				cacheName = intent.getStringExtra(EXTRA_NAME);
				geocode = intent.getStringExtra(EXTRA_GEOCODE);

				final double latitude = intent.getDoubleExtra(EXTRA_LATITUDE, 0d);
				final double longitude = intent.getDoubleExtra(EXTRA_LONGITUDE, 0d);

				hint = "";
				if (INTENT_GEAR.equals(action))
				{
					hint = intent.getStringExtra(EXTRA_HINT);
				}
				
				Context context = this.getBaseContext();
				if (context != null)
				{
			        Intent mainActivityIntent = new Intent();
			        
			        mainActivityIntent.setClassName("com.purplefoto.cgeogear", "com.purplefoto.cgeogear.CgeoGearMainActivity");
			        mainActivityIntent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
			        mainActivityIntent.putExtra(EXTRA_NAME, cacheName);
			        mainActivityIntent.putExtra(EXTRA_GEOCODE, geocode);
			        mainActivityIntent.putExtra(EXTRA_LATITUDE, latitude);
			        mainActivityIntent.putExtra(EXTRA_LONGITUDE, longitude);
			        mainActivityIntent.putExtra(EXTRA_HINT, hint);
			        context.startActivity(mainActivityIntent);			
		        }
			}
		}

		return START_STICKY;
	}

	@Override
	public IBinder onBind(Intent intent) {
		return null;
	}
}
