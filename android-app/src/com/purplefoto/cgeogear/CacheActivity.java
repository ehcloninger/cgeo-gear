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
import android.content.SharedPreferences;
import android.content.SharedPreferences.OnSharedPreferenceChangeListener;
import android.content.pm.PackageManager;
import android.os.Bundle;
import android.preference.PreferenceManager;
import android.util.Log;
import android.view.Menu;
import android.view.MenuInflater;
import android.view.MenuItem;
import android.view.View;
import android.widget.Button;
import android.widget.ImageButton;
import android.widget.TextView;
import android.widget.Toast;
import cgeo.geocaching.Intents;

import com.samsung.android.sdk.SsdkUnsupportedException;
import com.samsung.android.sdk.richnotification.Srn;
import com.samsung.android.sdk.richnotification.SrnRichNotificationManager;
import com.samsung.android.sdk.richnotification.SrnRichNotificationManager.ErrorType;
import com.samsung.android.sdk.richnotification.SrnRichNotificationManager.EventListener;

/**
 * This is the main UX for cgeo-gear. If the user starts the app, it displays
 * the usage information and prompts them to launch c:geo. When c:geo sends an
 * intent for the watch, it's activated by the service and data from the intent
 * populates the data fields.
 */
public class CacheActivity extends Activity implements EventListener {
	// Until it's in c:geo sources...
	// static final String EXTRA_HINT = "cgeo.geocaching.intent.extra.hint";

	public CacheActivity() {
	}

	TextView gccode = null;
	TextView gcname = null;
	TextView gclat = null;
	TextView gclon = null;
	TextView gchint = null;

	private CacheData cacheData = new CacheData();
	private ImageButton button = null;

	SrnRichNotificationManager srnManager;
	SharedPreferences preferences;

	boolean m_autosend = false;

	/** Called with the activity is first created. */
	@Override
	public void onCreate(Bundle savedInstanceState) {
		super.onCreate(savedInstanceState);

		preferences = PreferenceManager
				.getDefaultSharedPreferences(getApplicationContext());

		// Inflate our UI from its XML layout description.
		setContentView(R.layout.cache_activity);

		Srn srn = new Srn();
		try {
			// Initialize an instance of Srn.
			srn.initialize(this);
			srnManager = new SrnRichNotificationManager(getApplicationContext());
		} catch (SsdkUnsupportedException e) {
		}

		/*
		 * onSharedPreferenceChanged
		 * 
		 * Listener to detect when the user has changed a preference
		 */
		preferences
				.registerOnSharedPreferenceChangeListener(new OnSharedPreferenceChangeListener() {
					public void onSharedPreferenceChanged(
							SharedPreferences sharedPreferences, String key) {
					}
				});

		// This is where the magic happens. Set a handler for the button and
		// then wait for the user
		// to press it. On completion, return to c:geo
		button = (ImageButton) findViewById(R.id.send);
		button.setOnClickListener(new View.OnClickListener() {
			public void onClick(View v) {
				CacheActivity.this.sendToGear();
			}
		});
	}

	/*
	 * sendToGear
	 */
	private void sendToGear() {
		final Intent launchIntent = getCgeoIntent();

		// Assuming that if the cache data points to 0.00, 0.00 then we've
		// come here through some other means, so just go to c:geo
		if ((cacheData.getLat() != 0d) || (cacheData.getLon() != 0d)) {
			UUID uuid = cacheData.sendToGear(CacheActivity.this, srnManager);
			if (uuid != null)
				Toast.makeText(CacheActivity.this.getApplicationContext(),
						R.string.notification_sent, Toast.LENGTH_LONG).show();

			CacheActivity.this.finish();
		}

		if (launchIntent != null)
			CacheActivity.this.startActivity(launchIntent);
	}

	/*
	 * onRestoreInstanceState - lifecycle events that cause the Activity to go
	 * away, such as rotation, phone calls, etc.
	 * 
	 * @see android.app.Activity#onRestoreInstanceState(android.os.Bundle)
	 */
	protected void onRestoreInstanceState(Bundle savedInstanceState) {
		super.onRestoreInstanceState(savedInstanceState);
		Log.i(getPackageName(), "onRestoreInstanceState");

		m_autosend = savedInstanceState.getBoolean("enabled");
	}

	/*
	 * PFDock.onSaveInstanceState
	 * 
	 * @see android.app.Activity#onSaveInstanceState(android.os.Bundle)
	 */
	protected void onSaveInstanceState(Bundle outState) {
		// Save the last known latitude and longitude for fast restarts of the
		// maps service
		Log.i(getPackageName(), "onSaveInstanceState");
		outState.putBoolean("autosend", m_autosend);

		super.onSaveInstanceState(outState);
	}

	/*
	 * onCreateOptionsMenu
	 * 
	 * @see android.app.Activity#onCreateOptionsMenu(android.view.Menu)
	 */
	@Override
	public boolean onCreateOptionsMenu(Menu menu) {
		MenuInflater inflater = getMenuInflater();
		inflater.inflate(R.menu.main, menu);
		Log.i(getPackageName(), "onCreateOptionsMenu");

		return (super.onCreateOptionsMenu(menu));
	}

	/**
	 * Define menu action
	 * 
	 * @see android.app.Activity#onOptionsItemSelected(android.view.MenuItem)
	 */
	public boolean onOptionsItemSelected(MenuItem item) {
		Log.i(getPackageName(), "onOptionsItemSelected");
		if (item.getItemId() == R.id.settings) {
			// Show the preferences dialog (via a separate class)
			startActivity(new Intent(this, CgeoGearPreferences.class));
			return true;
		}

		return super.onOptionsItemSelected(item);
	}

	/*
	 * getCgeoIntent Retrieve reference to intent to launch c:geo. If c:geo not
	 * installed, returns null.
	 */
	private final Intent getCgeoIntent() {
		PackageManager manager = getPackageManager();

		// If package manager is null, you're hosed.
		if (manager == null)
			return null;

		return manager.getLaunchIntentForPackage("cgeo.geocaching");
	}

	/*
	 * setActivityLayoutData(Intent intent) Populates the UX with cache data
	 * from the launch intent. If data is null, it means user launced the app,
	 * so only present the usage instruction and the button will launch c:geo if
	 * it's installed.
	 */
	void setCacheDataFromIntent(Intent intent) {
		if (intent == null)
			return;

		cacheData.setName(intent.getStringExtra(Intents.EXTRA_NAME));
		cacheData.setCode(intent.getStringExtra(Intents.EXTRA_GEOCODE));
		cacheData.setLat(intent.getDoubleExtra(Intents.EXTRA_LATITUDE, 0d));
		cacheData.setLon(intent.getDoubleExtra(Intents.EXTRA_LONGITUDE, 0d));
	}

	/*
	 * setActivityLayoutData(Intent intent) Populates the UX with cache data
	 * from the launch intent. If data is null, it means user launced the app,
	 * so only present the usage instruction and the button will launch c:geo if
	 * it's installed.
	 */
	void setActivityLayoutData() {
		final String hint = "";
		/*
		 * Comment this out for production. Only pass along the hint to the
		 * watch, so it doesn't spoil the hunt for the user
		 */
		// hint = intent.getStringExtra(/* Intents. */ EXTRA_HINT);

		if ((cacheData.getLat() == 0d) && (cacheData.getLon() == 0d)) {
			gchint.setText(R.string.description);

			// Disable "Start c:geo" button if c:geo not installed
			button.setEnabled(getCgeoIntent() != null);
		} else {
			gccode.setText(cacheData.getCode());
			gcname.setText(cacheData.getName());

			// Pretty print as DD MM.SSS
			gclat.setText(String.format(
					"%2d %2.3f",
					(int) cacheData.getLat(),
					java.lang.Math.abs(cacheData.getLat()
							- (int) cacheData.getLat()) * 60));
			gclon.setText(String.format(
					"%3d %2.3f",
					(int) cacheData.getLon(),
					java.lang.Math.abs(cacheData.getLon()
							- (int) cacheData.getLon()) * 60));

//			gchint.setText(cacheData.makeString(this.getBaseContext()));
			gchint.setText(cacheData.getHint());
		}
	}

	/*
	 * onNewIntent Respond when user launches or activated from other task.
	 * 
	 * (non-Javadoc)
	 * 
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
		 * this. Update, setIntent seems to fix this, but I'm going to leave
		 * this comment in, just in case it pops up again.
		 */
		String action = intent.getAction();
		if (action != null)
			if (action.equals("android.intent.action.MAIN"))
				return;

		this.setIntent(intent);
		setCacheDataFromIntent(intent);
		setActivityLayoutData();
	}

	/*
	 * onResume Called from lifecycle when user resumes.
	 * 
	 * (non-Javadoc)
	 * 
	 * @see android.app.Activity#onResume()
	 */
	@Override
	protected void onResume() {
		super.onResume();
		setCacheDataFromIntent(this.getIntent());

		srnManager.start();
		srnManager.registerRichNotificationListener(this);

		m_autosend = preferences.getBoolean("autosend", false);
		if (m_autosend) {
			this.sendToGear();
			return;
		}

		// Assign values to UX elements. These could go in onCreate, but could
		// they change if app deactivated?
		// Maybe need to do something in onDestroy... TBD
		gccode = (TextView) this.findViewById(R.id.gccode);
		gcname = (TextView) this.findViewById(R.id.gcname);
		gclat = (TextView) this.findViewById(R.id.gclat);
		gclon = (TextView) this.findViewById(R.id.gclon);
		gchint = (TextView) this.findViewById(R.id.gchint);

		setActivityLayoutData();
	}

	/*
	 * onPause Lifecycle override
	 * 
	 * (non-Javadoc)
	 * 
	 * @see android.app.Activity#onPause()
	 */
	@Override
	protected void onPause() {
		super.onPause();

		srnManager.unregisterRichNotificationListener(this);
		srnManager.stop();
	}

	// Implement EventListener required interface
	@Override
	public void onError(UUID arg0, ErrorType arg1) {
		Toast.makeText(
				getApplicationContext(),
				"Something wrong with uuid" + arg0.toString() + "Error:"
						+ arg1.toString(), Toast.LENGTH_LONG).show();
	}

	@Override
	public void onRead(UUID arg0) {
		Toast.makeText(getApplicationContext(), "Read uuid" + arg0.toString(),
				Toast.LENGTH_LONG).show();

	}

	@Override
	public void onRemoved(UUID arg0) {
		Toast.makeText(getApplicationContext(),
				"Removed uuid" + arg0.toString(), Toast.LENGTH_LONG).show();

	}
}
