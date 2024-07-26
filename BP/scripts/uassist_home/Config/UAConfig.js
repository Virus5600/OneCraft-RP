export const UAConfig = {
    Homes: {
        /**
         * General animations.
         */
        Animations: {
            /**
             * Animation shown to the player about to be teleported to their home.
             */
            TeleportAnimationScreen: true,

            /**
             * Shows a particle animation when the player is being sent home.
             */
            TeleportParticles: true
        },

        /**
         * Default options, can be configured in-game.
         */
        Predetermined: {
            /**
             * Waiting time for the player to be teleported to their home.
             */
            WaitTime: 5,

            /**
             * Default number of homes each player will have.
             */
            NumberOfHomesByPlayer: 6,

            /**
             * If this is specified as "true" the player should not move while counting down.
             */
            BlockMovementDuringTeleport: false,

            /**
             * Allows all players to edit the dimension of their homes when editing them!!!
             * 
             * WARNING!!! If enabled, users will be able to create homes and edit the dimension, so they can move between dimensions quickly.
             */
            AllowHomeDimensionChange: false
        }
    },
    /**
     * Admin tags for OP
     */
    Admin: {
        // Tags
        Tags: ["admin", "mod", "helper"]
    },
    Horario: {
        UTC: -5, // Ajustar según el horario utc de tu region.
        Avanzado: {
            // Ajustes avanzados.
            Region: "America/Mexico_City",
            Local: "es-MX",
            AmPm: true,
            MostrarSegundos: false
        },

        /**
         * Activa esta función si es que los días osea la fecha se muestra mal
         * en especifico los días, si en días sale un dia mas, activa esta 
         * opción, si no hay error no la actives.
         */
        Error: {
            Activar: true
        }
    },
    /**
     * Developer options.
     */
    Developer: {
        /**
         * Sends messages left by the creator to the console.
         */
        ConsoleLog: false
    }
}