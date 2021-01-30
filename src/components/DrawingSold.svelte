<div class="container">

    <svg>

        <defs>
            <!-- Définit une pointe de flèche -->
            <marker id="arrow" viewBox="0 0 12 12" refX="0" refY="5"
                markerWidth="5" markerHeight="5" style="overflow: visible;"
                orient="auto-start-reverse">
                <path d="M 0 0 L 10 5 L 0 10 z" stroke-linejoin="round" style="animation: none; stroke-dasharray: none;"/>
            </marker>

        </defs>

        <!-- Provider - Proposé -->
        <line x1="50" y1="23" x2="170" y2="23" marker-end="url(#arrow)"/>

        <!-- Proposé - Validé -->
        <line x1="240" y1="47" x2="240" y2="128" marker-end="url(#arrow)"/>

        <!-- Validé - Vendu -->
        <line x1="240" y1="185" x2="240" y2="264" marker-end="url(#arrow)"/>

        <!-- Vendu - client-->
        <line x1="300" y1="300" x2="335" y2="300" marker-end="url(#arrow)"/>

        <!-- Proposé - Refusé -->
        <path d="M 240 47 L 240 56 Q 240 90 206 90 L 190 90" marker-end="url(#arrow)" class="w3-opacity"/>

        <!-- Validé - Rendu -->
        <path d="M 240 185 L 240 189 Q 240 225 206 225 L 190 225" marker-end="url(#arrow)" class="w3-opacity"/>

        <!-- Refusé - Provider -->
        <path d="M 120 116 L 120 122 Q 120 156 86 156 L 59 156 Q 25 156 25 122 L 25 62"  marker-end="url(#arrow)" class="w3-opacity"/>

        <!-- Rendu - Provider -->
        <path d="M 120 206 L 120 180 Q 120 156 86 156" class="w3-opacity"/>

    </svg>


    <i class="fas fa-user-alt"></i>

    <div class="state proposed">
        Proposé
    </div>

    <div class="state refused">
        Refusé
    </div>

    <div class="state valided">
        Validé
    </div>

    <div class="state giveback">
        Rendu
    </div>

    <i class="fas fa-child"></i>

    <div class="state sold">
        Vendu
    </div>

</div>

<style>

    .container {
        width: 400px;
        margin: auto;
        position: relative;
    }

    svg {
        position: absolute;
        width: 100%;
        height: 100%;
    }

    line, path {
        fill: none;
        stroke:rgb(200, 200, 200);
        stroke-width: 2;
        stroke-dasharray: 6;
        animation: dash .8s linear infinite;
    }

    @keyframes dash {
        to {stroke-dashoffset: -12;}
    }

    i {
        font-size: 3em;
        opacity: .6;
        position: absolute;
    }

    .fa-child {
        margin-top: 20px;
        margin-left: 40px;
        left: 300px;
    }

    .state {
        margin-top: 20px;
        margin-left: 60px;
        padding: 10px;
        text-align: center;
        text-transform: uppercase;
        font-weight: 400;
        font-size: 1em;
        width: 120px;
        border-radius: 6px;
        border: 2px solid;
    }

    .proposed, .valided, .sold {
        transform: translateX(120px);
    }

    .proposed {
        border-color:#f2f2f2;
    }

    .refused {
        border-color: #ffe6e6;
    }

    .valided {
        border-color: #e3fcff;
    }

    .giveback {
        border-color: #fff4e3;
    }

    .sold {
        border-color: #d9ffe0;
    }

</style>