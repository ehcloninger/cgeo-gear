
package com.purplefoto.cgeogear;

import android.app.Activity;
import android.content.Intent;
import android.os.Bundle;
import android.widget.Toast;

public class GearNotificationCallbackActivity extends Activity {

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        Intent intent = getIntent();

        String data = intent.getStringExtra("extra_action_data");

        if (data != null) {
            Toast.makeText(this, data, Toast.LENGTH_SHORT).show();
        }
    }
}
