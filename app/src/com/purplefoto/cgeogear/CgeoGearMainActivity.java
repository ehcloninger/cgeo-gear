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

package com.purplefoto.cgeogear;

import java.util.UUID;

import android.app.Activity;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.os.Bundle;
import android.view.View;
import android.widget.Button;
import android.widget.TextView;
import android.widget.Toast;
import cgeo.geocaching.Intents;

import com.samsung.android.sdk.SsdkUnsupportedException;
import com.samsung.android.sdk.richnotification.Srn;
import com.samsung.android.sdk.richnotification.SrnRichNotificationManager;
import com.samsung.android.sdk.richnotification.SrnRichNotificationManager.ErrorType;
import com.samsung.android.sdk.richnotification.SrnRichNotificationManager.EventListener;

/**
 * This is the main UX for cgeo-gear. If the user starts the app, it displays the usage information
 * and prompts them to launch c:geo.  When c:geo sends an intent for the watch, it's activated by
 * the service and data from the intent populates the data fields.
 */
public class CgeoGearMainActivity extends Activity implements EventListener {
	// Until it's in c:geo sources...
	// static final String EXTRA_HINT = "cgeo.geocaching.intent.extra.hint";

	public CgeoGearMainActivity() {
	}

	TextView gccode = null;
	TextView gcname = null;
	TextView gclat = null;
	TextView gclon = null;
	TextView gchint = null;

	private CacheData cacheData = new CacheData();
	private Button button = null;

    private SrnRichNotificationManager mRichNotificationManager;

	/** Called with the activity is first created. */
	@Override
	public void onCreate(Bundle savedInstanceState) {
		super.onCreate(savedInstanceState);

		// Inflate our UI from its XML layout description.
		setContentView(R.layout.main_activity);

        Srn srn = new Srn();
        try {
            // Initialize an instance of Srn.
            srn.initialize(this);
        } catch (SsdkUnsupportedException e) {
            // Error handling
        }

        mRichNotificationManager = new SrnRichNotificationManager(getApplicationContext());

        button = (Button) findViewById(R.id.send);
		button.setOnClickListener(new View.OnClickListener() {
			public void onClick(View v) {
				if ((cacheData.getLat() == 0d) && (cacheData.getLon() == 0d)) {
					final Intent launchIntent = getCgeoIntent();
					if (launchIntent == null)
						Toast.makeText(CgeoGearMainActivity.this, R.string.cgeo_not_installed, Toast.LENGTH_LONG).show();
					else
						CgeoGearMainActivity.this.startActivity(launchIntent);
				} else {
					sendToGear();
				}
			}
		});
	}

	/*
	 * getCgeoIntent
	 * Retrieve reference to intent to launch c:geo. If c:geo not installed, returns null.
	 */
	private final Intent getCgeoIntent()
	{
		PackageManager manager = getPackageManager();
		
		// If package manager is null, you're hosed.
		if (manager == null)
			return null;
			
		return manager.getLaunchIntentForPackage("cgeo.geocaching");
	}

	/*
	 * sendToGear
	 * Send data from intent to Gear watch. This is the interface to the Samsung Notification UI.
	 */
	private void sendToGear()
	{
		// TODO: Insert Gear notification code here
		CacheNotification notification = new CacheNotification(this.getBaseContext(), cacheData);
		
        UUID uuid = mRichNotificationManager.notify(notification.createRichNotification());
		
		Toast.makeText(CgeoGearMainActivity.this,
				"(" + cacheData.getCode() + ") " + cacheData.getName() + ": " + uuid.toString(), 
				Toast.LENGTH_LONG)
			.show();
		
		CgeoGearMainActivity.this.finish();
	}

	/*
	 * setActivityLayoutData(Intent intent)
	 * Populates the UX with cache data from the launch intent.  If data is null, it means user launced the app, 
	 * so only present the usage instruction and the button will launch c:geo if it's installed.
	 */
	void setActivityLayoutData(Intent intent) {
		if (intent == null)
			return;

		cacheData.setName(intent.getStringExtra(Intents.EXTRA_NAME));
		cacheData.setCode(intent.getStringExtra(Intents.EXTRA_GEOCODE));
		cacheData.setLat(intent.getDoubleExtra(Intents.EXTRA_LATITUDE, 0d));
		cacheData.setLon(intent.getDoubleExtra(Intents.EXTRA_LONGITUDE, 0d));
		
		final String hint = "";
//		hint = intent.getStringExtra(/* Intents. */ EXTRA_HINT);

		if ((cacheData.getLat() == 0d) && (cacheData.getLon() == 0d)) {
			button.setText(R.string.start_cgeo);
			gchint.setText(R.string.description);
			
			// Disable "Start c:geo" button if c:geo not installed
			button.setEnabled(getCgeoIntent() != null);
		} else {
			button.setText(R.string.send_to_gear);

			gccode.setText(cacheData.getCode());
			gcname.setText(cacheData.getName());
			
			// Pretty print as DD MM.SSS
			gclat.setText(String.format("%2d %2.3f", (int) cacheData.getLat(), java.lang.Math.abs(cacheData.getLat() - (int) cacheData.getLat()) * 60 ));
			gclon.setText(String.format("%3d %2.3f", (int) cacheData.getLon(), java.lang.Math.abs(cacheData.getLon() - (int) cacheData.getLon()) * 60 ));

			/*
			 * Comment this out for production. Only pass along the hint to the
			 * watch, so it doesn't spoil the hunt for the user
			 */
			gchint.setText(hint);
		}
	}

	/*
	 * onNewIntent
	 * Respond when user launches or activated from other task.
	 * 
	 * (non-Javadoc)
	 * @see android.app.Activity#onNewIntent(android.content.Intent)
	 */
	@Override
	protected void onNewIntent(Intent intent) {
		super.onNewIntent(intent);

		/*
		 * This doesn't quite feel right. I get 2 intents when I'm started from
		 * c:geo. The first one has all the data from the cache record and the
		 * second is a launch from MAIN. We never need to update the UI based on
		 * MAIN launcher events, so just eat it.
		 * 
		 * TODO: Research the Android lifecycle to find a better way to handle
		 * this.  Update, setIntent seems to fix this, but I'm going to leave this
		 * comment in, just in case it pops up again.
		 */
		String action = intent.getAction();
		if (action != null)
			if (action.equals("android.intent.action.MAIN"))
				return;

		this.setIntent(intent);
		setActivityLayoutData(intent);
	}

	/*
	 * onResume
	 * Called from lifecycle when user resumes. 
	 * 
	 * (non-Javadoc)
	 * @see android.app.Activity#onResume()
	 */
	@Override
	protected void onResume() {
		super.onResume();

        mRichNotificationManager.start();
        mRichNotificationManager.registerRichNotificationListener(this);

        // Assign values to UX elements.  These could go in onCreate, but could they change if app deactivated?
		// Maybe need to do something in onDestroy... TBD
		
		gccode = (TextView) this.findViewById(R.id.gccode);
		gcname = (TextView) this.findViewById(R.id.gcname);
		gclat = (TextView) this.findViewById(R.id.gclat);
		gclon = (TextView) this.findViewById(R.id.gclon);
		gchint = (TextView) this.findViewById(R.id.gchint);

		setActivityLayoutData(this.getIntent());

	}
	
	/*
	 * onPause
	 * Lifecycle override
	 * 
	 * (non-Javadoc)
	 * @see android.app.Activity#onPause()
	 */
    @Override
    protected void onPause() {
        super.onPause();

        mRichNotificationManager.unregisterRichNotificationListener(this);
        mRichNotificationManager.stop();
    }

    // Implement EventListener required interface
    @Override
    public void onError(UUID arg0, ErrorType arg1) {
        Toast.makeText(getApplicationContext(),
                "Something wrong with uuid" + arg0.toString() + "Error:" + arg1.toString(),
                Toast.LENGTH_LONG).show();
    }

    @Override
    public void onRead(UUID arg0) {
        Toast.makeText(getApplicationContext(), "Read uuid" + arg0.toString(), Toast.LENGTH_LONG)
                .show();

    }

    @Override
    public void onRemoved(UUID arg0) {
        Toast.makeText(getApplicationContext(), "Removed uuid" + arg0.toString(), Toast.LENGTH_LONG)
                .show();

    }
}
