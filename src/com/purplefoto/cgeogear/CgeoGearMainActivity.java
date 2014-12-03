/*
 * Copyright (C) 2007 The Android Open Source Project
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

package com.purplefoto.cgeogear;

import android.app.Activity;
import android.content.Intent;
import android.os.Bundle;
import android.view.View;
import android.widget.Button;
import android.widget.TextView;

/**
 * This class provides a basic demonstration of how to write an Android
 * activity. Inside of its window, it places a single view: an EditText that
 * displays and edits some internal text.
 */
public class CgeoGearMainActivity extends Activity {
    
    public CgeoGearMainActivity() {
    }

    private static final String PREFIX = "cgeo.geocaching.intent.extra.";

    public static final String EXTRA_LATITUDE = PREFIX + "latitude";
    public static final String EXTRA_LONGITUDE = PREFIX + "longitude";
    public static final String EXTRA_GEOCODE = PREFIX + "geocode";
    public static final String EXTRA_HINT = PREFIX + "hint";
    public static final String EXTRA_NAME = PREFIX + "name";

    TextView gccode = null;
    TextView gcname = null;
    TextView gclat = null;
    TextView gclon = null;
    TextView gchint = null;
    
    private String code;
    private String name;
    private double lat;
    private double lon;
    private String hint;
    
    /** Called with the activity is first created. */
    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        // Inflate our UI from its XML layout description.
        setContentView(R.layout.main_activity);

        gccode = (TextView) this.findViewById(R.id.gccode);
        gcname = (TextView) this.findViewById(R.id.gcname);
        gclat = (TextView) this.findViewById(R.id.gclat);
        gclon = (TextView) this.findViewById(R.id.gclon);
        gchint = (TextView) this.findViewById(R.id.gchint);
        
        Intent intent = this.getIntent();
		name = intent.getStringExtra(EXTRA_NAME);
		code = intent.getStringExtra(EXTRA_GEOCODE);

		lat = intent.getDoubleExtra(EXTRA_LATITUDE, 0d);
		lon = intent.getDoubleExtra(EXTRA_LONGITUDE, 0d);

		hint = intent.getStringExtra(EXTRA_HINT);
		
    	gccode.setText(code);
    	gcname.setText(name);
    	gclat.setText(String.format("%.0f", lat));
    	gclon.setText(String.format("%.0f", lon));
    	
    	// Comment this out for production
    	gchint.setText(hint);
       
        final Button button = (Button) findViewById(R.id.send);
        button.setOnClickListener(new View.OnClickListener() {
            public void onClick(View v) {
                // Perform action on click
            }
        });
   }

    /**
     * Called when the activity is about to start interacting with the user.
     */
    @Override
    protected void onResume() {
        super.onResume();
    }
 }
