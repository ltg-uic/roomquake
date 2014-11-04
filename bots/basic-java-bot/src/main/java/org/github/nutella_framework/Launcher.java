package org.github.nutella_framework;

/**
 * Created by tebemis on 10/7/14.
 */
public class Launcher {
    public static void main(String[] args) {
        // Initializes nutella with the values passed in from the framework
        Nutella.init(args);
        // Starts the bot
        new Thread(new BasicBot()).start();
    }
}
