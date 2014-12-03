/*
	Copyright 2014 Purplefoto
 */

// Credit to Cullin Moran (github:culmor30) for Service outline

package com.purplefoto.cgeogear;

import android.app.Service;
import android.content.Context;
import android.content.Intent;
import android.os.IBinder;
import cgeo.geocaching.Intents;

public class GearService extends Service {
	public static final String DEBUG_TAG = "com.purplefoto.cgearo";

	private static final String INTENT_GEAR = "cgeo.geocaching.gear.NAVIGATE_TO";
	private static final String INTENT_WEAR = "cgeo.geocaching.wear.NAVIGATE_TO";

	@Override
	public int onStartCommand(Intent intent, int flags, int startId) {
		if(intent != null) {
			final String action = intent.getAction();
			if(INTENT_WEAR.equals(action) || INTENT_GEAR.equals(action) ) {
				Context context = this.getBaseContext();
				if (context != null)
				{
			        Intent mainActivityIntent = new Intent();
			        
			        mainActivityIntent.setClassName("com.purplefoto.cgeogear", "com.purplefoto.cgeogear.CgeoGearMainActivity")
			        					.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
			        					.putExtra(Intents.EXTRA_NAME, intent.getStringExtra(Intents.EXTRA_NAME))
							        	.putExtra(Intents.EXTRA_GEOCODE, intent.getStringExtra(Intents.EXTRA_GEOCODE))
							        	.putExtra(Intents.EXTRA_LATITUDE, intent.getDoubleExtra(Intents.EXTRA_LATITUDE, 0d))
							        	.putExtra(Intents.EXTRA_LONGITUDE, intent.getDoubleExtra(Intents.EXTRA_LONGITUDE, 0d));
					if (INTENT_GEAR.equals(action))
					{
						mainActivityIntent.putExtra(Intents.EXTRA_HINT, intent.getStringExtra(Intents.EXTRA_HINT));
					}
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
