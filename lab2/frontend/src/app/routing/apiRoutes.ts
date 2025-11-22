'use client';

export const apiRoutes = {
    auth: {
        fetch: `${process.env.NEXT_PUBLIC_API_BASE_URL}/users/me`,
        security: `${process.env.NEXT_PUBLIC_API_BASE_URL}/info/security`,
        signup: `${process.env.NEXT_PUBLIC_API_BASE_URL}/users/signup`,
        ...{}
    },
    objects: {
        fetch: `${process.env.NEXT_PUBLIC_API_BASE_URL}/objects`,
        test: `${process.env.NEXT_PUBLIC_API_BASE_URL}/objects/test`,
        create: `${process.env.NEXT_PUBLIC_API_BASE_URL}/objects`,
        update: `${process.env.NEXT_PUBLIC_API_BASE_URL}/objects`,
        migrate_base: `${process.env.NEXT_PUBLIC_API_BASE_URL}/objects`,
        migrate_half: `${process.env.NEXT_PUBLIC_API_BASE_URL}/objects/capital/migrate-half`,
        by_goverment: `${process.env.NEXT_PUBLIC_API_BASE_URL}/objects/government`,
        by_attack_level: `${process.env.NEXT_PUBLIC_API_BASE_URL}/utils/delete/by-attack-level`,
        distribute_rings: `${process.env.NEXT_PUBLIC_API_BASE_URL}/distribute-rings`,
        by_timezone: `${process.env.NEXT_PUBLIC_API_BASE_URL}/utils/delete/by-attack-level/`,
        stats_per_user: `${process.env.NEXT_PUBLIC_API_BASE_URL}/stats/objects-per-user`,
        unique_defense_levels: `${process.env.NEXT_PUBLIC_API_BASE_URL}/utils/unique/defense-levels`,
        group_by_creature_type: `${process.env.NEXT_PUBLIC_API_BASE_URL}/utils/group-by/creature-type`,
        by_id: `${process.env.NEXT_PUBLIC_API_BASE_URL}/objects`,
        import: `${process.env.NEXT_PUBLIC_API_BASE_URL}/import`,
        import_history: `${process.env.NEXT_PUBLIC_API_BASE_URL}/import/history`,
    },
    ws: {
        base: process.env.NEXT_PUBLIC_WS_BASE_URL,
    }
};

export async function loadKeycloakConfig() {
    const keycloakConfigUrl = `${process.env.NEXT_PUBLIC_KC_BASE_URL}/realms/${process.env.NEXT_PUBLIC_KC_REALM}/.well-known/openid-configuration`;
    console.log(keycloakConfigUrl)

    try {
        const response = await fetch(keycloakConfigUrl);
        const config = await response.json();
        Object.assign(apiRoutes.auth, config);
        console.log(apiRoutes.auth.token_endpoint)
        console.log('Keycloak configuration loaded:', apiRoutes.auth);
    } catch (error) {
        console.error('Failed to load Keycloak configuration:', error);
    }
}

loadKeycloakConfig().then(() => {
    console.log('Keycloak configuration loaded!');
});
