package com.serezk4.gateway;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

import java.math.BigDecimal;

@SpringBootApplication(scanBasePackages = "com.serezk4.gateway")
public class GatewayApplication {
    public static void main(String... args) {
        SpringApplication.run(GatewayApplication.class, args);
    }
}
