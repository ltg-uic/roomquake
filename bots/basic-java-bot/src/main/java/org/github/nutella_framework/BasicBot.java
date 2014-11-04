package org.github.nutella_framework;

import com.fasterxml.jackson.databind.JsonNode;

/**
 * Created by tebemis on 10/7/14.
 */
public class BasicBot extends Bot {

    @Override
    public void run() {
        // The code for your bot goes here!
        nutella.subscribe("test", new NutellaMessageListener() {
            @Override
            public void processMessage(JsonNode jsonNode) {
                System.out.println("We just received a message via MQTT: " + jsonNode.toString() );
            }
        });

        while(true) {
            try {
                Thread.sleep(5000);
            } catch (InterruptedException e) {
                // we have been interrupted
            }
        }
    }

}
