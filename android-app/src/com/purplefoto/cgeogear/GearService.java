/*
	Copyright 2014 Eric Cloninger (purplefoto.com)
	
	Licensed under the Apache License, Version 2.0 (the "License");
	you may not use this file except in compliance with the License.
	You may obtain a copy of the License at
		http://www.apache.org/licenses/LICENSE-2.0
	Unless required by applicable law or agreed to in writing, software
	distributed under the License is distributed on an "AS IS" BASIS,
	WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
	See the License for the specific language governing permissions and
	limitations under the License.
 */


// Credit to Cullin Moran (github:culmor30) for Service outline from cgeo-wear

package com.purplefoto.cgeogear;

import android.app.Service;
import android.content.Context;
import android.content.Intent;
import android.os.IBinder;
import cgeo.geocaching.Intents;

public class GearService extends Service {
	// Until it's in c:geo sources...
	// static final String EXTRA_HINT = "cgeo.geocaching.intent.extra.hint";

	public static final String DEBUG_TAG = "com.purplefoto.cgeogear";

	// Don't yet provide this intent
	// private static final String INTENT_GEAR = "cgeo.geocaching.gear.NAVIGATE_TO";
	private static final String INTENT_WEAR = "cgeo.geocaching.wear.NAVIGATE_TO";

	/*
	 * onStartCommand
	 * Respond to intent from c:geo to launch activity to display a geocache on Gear watch.
	 * 
	 * (non-Javadoc)
	 * @see android.app.Service#onStartCommand(android.content.Intent, int, int)
	 */
	@Override
	public int onStartCommand(Intent intent, int flags, int startId) {
		if(intent != null) {
			final String action = intent.getAction();
			if(INTENT_WEAR.equals(action) 
					// || INTENT_GEAR.equals(action) 
					) {
				Context context = this.getBaseContext();
				if (context != null)
				{
			        Intent mainActivityIntent = new Intent();
			        
			        mainActivityIntent.setClassName("com.purplefoto.cgeogear", "com.purplefoto.cgeogear.CacheActivity")
			        					.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
			        					.putExtra(Intents.EXTRA_NAME, intent.getStringExtra(Intents.EXTRA_NAME))
							        	.putExtra(Intents.EXTRA_GEOCODE, intent.getStringExtra(Intents.EXTRA_GEOCODE))
							        	.putExtra(Intents.EXTRA_LATITUDE, intent.getDoubleExtra(Intents.EXTRA_LATITUDE, 0d))
							        	.putExtra(Intents.EXTRA_LONGITUDE, intent.getDoubleExtra(Intents.EXTRA_LONGITUDE, 0d));
			        
			        // When c:geo supports Gear intent, have hint added in putExtra
//					if (INTENT_GEAR.equals(action))
//					{
//						mainActivityIntent.putExtra(/* Intents. */ EXTRA_HINT, intent.getStringExtra(/* Intents. */ EXTRA_HINT));
//					}
					
					mainActivityIntent.addFlags(Intent.FLAG_ACTIVITY_SINGLE_TOP);
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
